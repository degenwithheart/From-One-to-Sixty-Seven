# Variant: Embedded Systems / IoT

> Domain: Microcontrollers, real-time OS, resource-constrained devices
> Focus: Memory safety, deterministic timing, power efficiency, reliability

## Core Principles

### Resource Constraints
```c
// Embedded systems: bytes matter
//
// ASSUMPTIONS:
// - Flash: 32KB - 512KB typical
// - RAM: 2KB - 128KB typical
// - No heap allocation in critical paths
// - Stack depth monitored

#include <stdint.h>
#include <stdbool.h>

// Static allocation only
static uint8_t sensor_buffer[256];  // Pre-allocated
static uint8_t tx_buffer[64];       // UART TX
static uint8_t rx_buffer[64];       // UART RX

typedef struct {
    uint32_t timestamp;    // 4 bytes
    int16_t temperature;   // 2 bytes
    uint16_t humidity;     // 2 bytes
    uint8_t status;        // 1 byte
    // Padding: 1 byte for alignment
} SensorReading;  // Total: 10 bytes (packed)
_Static_assert(sizeof(SensorReading) == 10, "Unexpected struct size");

// Ring buffer for efficient data flow
typedef struct {
    uint8_t* buffer;
    volatile uint16_t head;
    volatile uint16_t tail;
    uint16_t size;
} RingBuffer;

static inline bool ring_buffer_write(RingBuffer* rb, uint8_t data) {
    uint16_t next = (rb->head + 1) % rb->size;
    if (next == rb->tail) {
        return false;  // Buffer full
    }
    rb->buffer[rb->head] = data;
    rb->head = next;
    return true;
}
```

### Real-Time Guarantees
```c
// Deterministic execution with timing guarantees
//
// ASSUMPTIONS:
// - Worst-case execution time (WCET) analysis
// - Interrupt latency < 100 cycles
// - No dynamic memory allocation in ISR

#include <cmsis_os2.h>

// Task periods (milliseconds)
#define SENSOR_PERIOD_MS    10   // 100 Hz
#define CONTROL_PERIOD_MS   50   // 20 Hz
#define COMMS_PERIOD_MS     100   // 10 Hz
#define DISPLAY_PERIOD_MS  1000  // 1 Hz

void sensor_task(void *argument) {
    uint32_t tick_count;
    
    while (1) {
        tick_count = osKernelGetTickCount();
        
        // Read sensors
        // ASSUMPTIONS:
        // - ADC conversion: < 100 us
        // - I2C read: < 1 ms
        read_temperature_sensor();
        read_humidity_sensor();
        
        // Fixed execution time - no conditional delays
        process_sensor_data();
        
        // Calculate next wake time for jitter-free scheduling
        osDelayUntil(tick_count + SENSOR_PERIOD_MS);
    }
}

void control_task(void *argument) {
    while (1) {
        // Wait for notification from sensor task
        osEventFlagsWait(control_event, 0x01, osFlagsWaitAny, osWaitForever);
        
        // Control algorithm
        // ASSUMPTIONS:
        // - PID computation: < 5 ms
        // - Output update: atomic operation
        int16_t error = target_temp - current_temp;
        int16_t output = pid_compute(&pid_controller, error);
        
        // Atomic update of actuator
        __disable_irq();
        pwm_set_duty(output);
        __enable_irq();
        
        osDelay(CONTROL_PERIOD_MS);
    }
}
```

### Memory Safety
```c
// No dynamic allocation, bounded buffers
//
// SECURITY NOTE:
// - All buffers have compile-time size limits
// - String operations use bounded variants
// - Stack canary for overflow detection

// Bounded string copy
static inline void safe_strncpy(char* dest, const char* src, size_t size) {
    if (size > 0) {
        strncpy(dest, src, size - 1);
        dest[size - 1] = '\0';
    }
}

// Bounded memory operations
void parse_message(const uint8_t* data, size_t len) {
    // Validate length bounds
    if (len > MAX_MESSAGE_SIZE) {
        log_error("Message too large: %zu bytes", len);
        return;
    }
    
    // Fixed-size local buffer
    uint8_t buffer[MAX_MESSAGE_SIZE];
    memcpy(buffer, data, len);  // Safe: len checked above
    
    // Parse with state machine (no recursion)
    ParserState state = STATE_IDLE;
    for (size_t i = 0; i < len; i++) {
        state = state_machine_update(state, buffer[i]);
        if (state == STATE_ERROR) {
            log_error("Parse error at offset %zu", i);
            return;
        }
    }
}

// Memory pool for fixed-size objects
typedef struct {
    union {
        Message msg;
        uint8_t _pad[64];  // Alignment
    } slots[POOL_SIZE];
    bool used[POOL_SIZE];
} MemoryPool;

void* pool_alloc(MemoryPool* pool) {
    for (int i = 0; i < POOL_SIZE; i++) {
        if (!pool->used[i]) {
            pool->used[i] = true;
            return &pool->slots[i];
        }
    }
    return NULL;  // Pool exhausted
}

void pool_free(MemoryPool* pool, void* ptr) {
    ptrdiff_t offset = (uint8_t*)ptr - (uint8_t*)pool->slots;
    int index = offset / sizeof(pool->slots[0]);
    
    // Validate pointer belongs to pool
    if (index >= 0 && index < POOL_SIZE) {
        pool->used[index] = false;
    }
}
```

### Power Management
```c
// Aggressive power optimization
//
// ASSUMPTIONS:
// - Sleep when idle
// - Peripherals clock-gated when unused
// - Wake only on interrupt

void enter_low_power_mode(void) {
    // Disable unused peripherals
    RCC->AHB1ENR &= ~(RCC_AHB1ENR_GPIOBEN | RCC_AHB1ENR_GPIOCEN);
    RCC->APB1ENR &= ~(RCC_APB1ENR_USART2EN | RCC_APB1ENR_I2C1EN);
    
    // Configure wake sources
    EXTI->IMR |= EXTI_IMR_MR0;  // Wake on button press
    EXTI->RTSR |= EXTI_RTSR_TR0; // Rising edge trigger
    
    // Enter STOP mode (retains RAM, wakes in < 10 us)
    SCB->SCR |= SCB_SCR_SLEEPDEEP_Msk;
    __WFI();  // Wait for interrupt
    
    // Restore clocks on wake
    SystemClock_Config();
}

// Adaptive sampling based on activity
void adaptive_sensor_sampling(void) {
    static uint32_t last_activity = 0;
    static uint8_t sample_rate = HIGH_RATE;  // 100 Hz
    
    uint32_t now = HAL_GetTick();
    
    if (detect_activity()) {
        last_activity = now;
        if (sample_rate != HIGH_RATE) {
            sample_rate = HIGH_RATE;
            configure_adc_rate(HIGH_RATE);
        }
    } else if (now - last_activity > INACTIVITY_TIMEOUT_MS) {
        if (sample_rate != LOW_RATE) {
            sample_rate = LOW_RATE;  // 1 Hz
            configure_adc_rate(LOW_RATE);
        }
    }
}
```

### Communication Protocols
```c
// Efficient binary protocols
//
// ASSUMPTIONS:
// - Little-endian (ARM Cortex-M default)
// - Checksums for integrity
// - Sequence numbers for ordering
// - Ack/nack for reliability

typedef struct __attribute__((packed)) {
    uint8_t magic;           // 0xAA for protocol identification
    uint8_t version;         // Protocol version
    uint8_t type;            // Message type
    uint8_t flags;           // Control flags
    uint16_t sequence;       // Sequence number
    uint16_t length;         // Payload length (little-endian)
    uint8_t payload[];       // Flexible array member
} MessageHeader;

#define HEADER_SIZE 8
#define MAX_PAYLOAD_SIZE 512
#define MAGIC_BYTE 0xAA

typedef enum {
    MSG_TYPE_DATA = 0x01,
    MSG_TYPE_ACK = 0x02,
    MSG_TYPE_NACK = 0x03,
    MSG_TYPE_HEARTBEAT = 0x04,
    MSG_TYPE_CONFIG = 0x05,
} MessageType;

// CRC-16/CCITT-FALSE for message integrity
static uint16_t calculate_crc(const uint8_t* data, size_t len) {
    uint16_t crc = 0xFFFF;
    for (size_t i = 0; i < len; i++) {
        crc ^= (uint16_t)data[i] << 8;
        for (int j = 0; j < 8; j++) {
            crc = (crc & 0x8000) ? (crc << 1) ^ 0x1021 : crc << 1;
        }
    }
    return crc;
}

bool process_incoming_message(const uint8_t* data, size_t len) {
    // Minimum size check
    if (len < HEADER_SIZE + 2) {  // Header + CRC
        return false;
    }
    
    // Verify magic byte
    if (data[0] != MAGIC_BYTE) {
        log_error("Invalid magic byte: 0x%02X", data[0]);
        return false;
    }
    
    // Parse header
    const MessageHeader* header = (const MessageHeader*)data;
    uint16_t payload_len = header->length;
    
    // Bounds check
    if (payload_len > MAX_PAYLOAD_SIZE) {
        log_error("Payload too large: %u bytes", payload_len);
        return false;
    }
    
    // Verify length matches
    if (len != HEADER_SIZE + payload_len + 2) {
        log_error("Length mismatch: expected %zu, got %zu",
                  HEADER_SIZE + payload_len + 2, len);
        return false;
    }
    
    // Verify CRC
    uint16_t received_crc = (data[len - 2] << 8) | data[len - 1];
    uint16_t calculated_crc = calculate_crc(data, len - 2);
    
    if (received_crc != calculated_crc) {
        log_error("CRC mismatch: received 0x%04X, calculated 0x%04X",
                  received_crc, calculated_crc);
        send_nack(header->sequence, NACK_REASON_CRC_ERROR);
        return false;
    }
    
    // Process based on type
    switch (header->type) {
        case MSG_TYPE_DATA:
            return handle_data_message(header, data + HEADER_SIZE, payload_len);
        case MSG_TYPE_ACK:
            return handle_ack_message(header->sequence);
        case MSG_TYPE_HEARTBEAT:
            return handle_heartbeat();
        default:
            log_error("Unknown message type: 0x%02X", header->type);
            return false;
    }
}
```

### Watchdog & Fault Recovery
```c
// Hardware watchdog for reliability
//
// ASSUMPTIONS:
// - Watchdog timeout: 1 second
// - Kick every < 500 ms in normal operation
// - Reset reason logged to EEPROM

void watchdog_init(void) {
    // Configure independent watchdog (IWDG)
    // Timeout = 1 second at 32 kHz
    IWDG->KR = 0x5555;  // Enable register access
    IWDG->PR = IWDG_PR_PR_2;  // Prescaler /16
    IWDG->RLR = 2000;   // Reload value (1 second)
    IWDG->KR = 0xCCCC;  // Start watchdog
}

void watchdog_kick(void) {
    IWDG->KR = 0xAAAA;  // Reset watchdog counter
}

// Fault handlers with EEPROM logging
typedef struct {
    uint32_t timestamp;
    uint8_t fault_type;
    uint32_t pc;           // Program counter
    uint32_t lr;           // Link register
    uint32_t fault_addr;   // Faulting address (if applicable)
} FaultRecord;

void HardFault_Handler(void) {
    __asm volatile (
        "tst lr, #4\n"           // Test EXC_RETURN bit
        "ite eq\n"
        "mrseq r0, msp\n"        // Main stack pointer
        "mrsne r0, psp\n"        // Process stack pointer
    );
    
    FaultRecord record = {
        .timestamp = get_rtc_timestamp(),
        .fault_type = FAULT_HARD,
        .pc = ((uint32_t*)__get_PSP())[6],  // Stacked PC
        .lr = ((uint32_t*)__get_PSP())[5],  // Stacked LR
    };
    
    // Log to EEPROM before reset
    eeprom_write_fault_record(&record);
    
    // Trigger watchdog reset
    while (1);
}

// Startup: check for previous faults
void check_previous_fault(void) {
    FaultRecord record;
    if (eeprom_read_last_fault(&record)) {
        log_error("Previous fault detected:");
        log_error("  Type: %d, Time: %lu", record.fault_type, record.timestamp);
        log_error("  PC: 0x%08X", record.pc);
        
        // Clear fault record
        eeprom_clear_fault_records();
        
        // Take recovery action based on fault type
        if (record.fault_type == FAULT_HARD && record.count > 3) {
            // Too many hard faults - safe mode
            enter_safe_mode();
        }
    }
}
```

## SUMMARY

Embedded Systems / IoT variant:
1. Static allocation - no heap in production
2. Deterministic timing with WCET analysis
3. Memory safety through bounds checking
4. Power optimization with sleep modes
5. Efficient binary protocols with CRC
6. Hardware watchdog for reliability
7. Fault logging and recovery
8. Stack depth monitoring
9. Atomic operations for thread safety
10. Minimal code size optimization
