# Variant: Game Development

> Domain: Interactive entertainment, real-time systems, physics, rendering
> Focus: Performance, determinism, debugging, content pipelines

## Core Principles

### Performance First
```cpp
// Critical path code requires different priorities
// 
// ASSUMPTIONS:
// - Hot paths optimized for cache coherency
// - Memory allocation minimized in game loop
// - SIMD intrinsics used where beneficial

class ParticleSystem {
    // Contiguous memory for cache efficiency
    std::vector<Particle> particles;  // Not std::list
    
    // Pre-allocated to avoid runtime allocation
    static constexpr size_t MAX_PARTICLES = 10000;
    
public:
    void update(float deltaTime) {
        // Branchless where possible for SIMD
        for (auto& p : particles) {
            p.position += p.velocity * deltaTime;
            p.life -= deltaTime;
            p.active = p.life > 0.0f;  // No if-statement
        }
    }
};
```

### Deterministic Simulation
```cpp
// Multiplayer and replay systems require determinism
//
// SECURITY NOTE:
// - Never use floating point for networked state
// - Fixed-point math for physics

struct Transform {
    FixedPoint x, y, z;      // 16.16 fixed-point
    FixedPoint qx, qy, qz, qw;  // Quaternion rotation
    
    // Deterministic operations only
    Transform interpolate(const Transform& other, FixedPoint t) const {
        return {
            lerp(x, other.x, t),
            lerp(y, other.y, t),
            lerp(z, other.z, t),
            slerp(qx, other.qx, t),  // Spherical interpolation
            // ...
        };
    }
};

// Hash-based checksums for state validation
uint64_t computeStateHash(const GameState& state) {
    // Deterministic hash across platforms
    return XXH3_64bits(&state, sizeof(GameState));
}
```

### Memory Management
```cpp
// Game loop memory: zero allocations
//
// ASSUMPTIONS:
// - Frame budget: 16ms (60fps) or 33ms (30fps)
// - No GC pauses, no malloc during gameplay

class FrameAllocator {
    char* buffer;
    size_t offset;
    size_t capacity;
    
public:
    void* allocate(size_t size) {
        size_t aligned = (size + 7) & ~7;  // 8-byte alignment
        
        ASSUME(offset + aligned <= capacity, "Frame allocation overflow");
        
        void* ptr = buffer + offset;
        offset += aligned;
        return ptr;
    }
    
    void reset() { offset = 0; }  // Fast deallocation
};

// Usage
FrameAllocator frameAlloc;

void gameLoop() {
    frameAlloc.reset();  // O(1) reset
    
    // All transient allocations use frameAlloc
    auto tempBuffer = frameAlloc.allocate(1024);
    auto debugLines = frameAlloc.allocate(maxDebugLines * sizeof(Line));
    
    // Memory automatically freed at frame end
}
```

## Architecture Patterns

### Entity Component System (ECS)
```cpp
// Data-oriented design for cache efficiency
//
// ASSUMPTIONS:
// - Components are POD (plain old data)
// - Systems process contiguous arrays
// - No virtual functions in hot paths

struct Position { float x, y, z; };
struct Velocity { float x, y, z; };
struct Health { int current, max; };

class MovementSystem {
public:
    void update(ComponentManager& cm, float dt) {
        // Contiguous arrays, cache-friendly
        auto positions = cm.query<Position>();
        auto velocities = cm.query<Velocity>();
        
        // SIMD-friendly loop
        const size_t count = positions.size();
        for (size_t i = 0; i < count; ++i) {
            positions[i].x += velocities[i].x * dt;
            positions[i].y += velocities[i].y * dt;
            positions[i].z += velocities[i].z * dt;
        }
    }
};
```

### Asset Pipeline
```python
# Content pipeline for optimized assets
#
# ASSUMPTIONS:
# - Source assets in version control (blender, psd)
# - Build pipeline generates runtime formats
# - Incremental builds for iteration speed

class AssetBuilder:
    """Build optimized assets from source."""
    
    def build_texture(self, source_path: Path) -> Texture:
        """
        Convert source texture to runtime format.
        
        SECURITY NOTE:
        - Validate texture dimensions (prevent memory DoS)
        - Strip metadata that might contain sensitive info
        """
        img = Image.open(source_path)
        
        # Validate dimensions
        if img.width > 8192 or img.height > 8192:
            raise ValueError(f"Texture too large: {img.size}")
        
        # Compress to runtime format
        if self.platform == "mobile":
            return self.compress_astc(img)  # ASTC for mobile
        else:
            return self.compress_bc7(img)   # BC7 for desktop
    
    def build_mesh(self, source_path: Path) -> Mesh:
        """
        Optimize mesh for runtime.
        
        ASSUMPTIONS:
        - Vertex cache optimization
        - LOD generation
        - Collision mesh extraction
        """
        mesh = load_mesh(source_path)
        
        # Optimize vertex cache
        mesh.indices = tipsify(mesh.indices)  # Tom Forsyth's algorithm
        
        # Generate LODs
        for lod_level in range(1, 4):
            ratio = 0.5 ** lod_level
            mesh.lods.append(simplify_mesh(mesh, ratio))
        
        return mesh
```

## Debugging & Profiling

```cpp
// Comprehensive instrumentation
//
// ASSUMPTIONS:
// - Debug builds have full instrumentation
// - Release builds can enable via flag
// - Minimal overhead when disabled

#ifdef ENABLE_PROFILING
    #define PROFILE_SCOPE(name) ProfilerScope _prof(name)
    #define PROFILE_BEGIN(name) Profiler::begin(name)
    #define PROFILE_END(name) Profiler::end(name)
#else
    #define PROFILE_SCOPE(name) ((void)0)
    #define PROFILE_BEGIN(name) ((void)0)
    #define PROFILE_END(name) ((void)0)
#endif

class GameRenderer {
public:
    void render() {
        PROFILE_SCOPE("GameRenderer::render");
        
        {
            PROFILE_SCOPE("Shadow pass");
            renderShadows();
        }
        
        {
            PROFILE_SCOPE("G-buffer");
            renderGBuffer();
        }
        
        {
            PROFILE_SCOPE("Lighting");
            applyLighting();
        }
    }
};

// In-game profiling display
void showProfilerUI() {
    ImGui::Begin("Profiler");
    
    for (const auto& scope : Profiler::getScopes()) {
        float ms = scope.timeMs;
        ImVec4 color = ms > 16.0f ? RED : (ms > 8.0f ? YELLOW : GREEN);
        
        ImGui::TextColored(color, "%s: %.2f ms", scope.name, ms);
        
        // Budget warning
        if (ms > scope.budgetMs) {
            ImGui::SameLine();
            ImGui::TextColored(RED, "[! OVER BUDGET]");
        }
    }
    
    ImGui::End();
}
```

## Networking

```cpp
// Authoritative server architecture
//
// SECURITY NOTE:
// - Never trust client input
// - Server validates all actions
// - Client-side prediction for responsiveness

class NetworkManager {
    // Input queue with timestamp
    struct ClientInput {
        uint32_t sequenceNumber;
        float timestamp;
        InputCommand commands;
    };
    
public:
    void onClientInput(const ClientInput& input) {
        // Validate timestamp (prevent time manipulation)
        if (abs(input.timestamp - serverTime) > 1.0f) {
            log.warn("Invalid timestamp from client {}", input.playerId);
            return;  // Reject suspicious input
        }
        
        // Server simulates with input
        gameState.applyInput(input);
        
        // Send state delta to client
        broadcastStateDelta();
    }
    
    void broadcastStateDelta() {
        // Delta compression for bandwidth
        // Only send changed fields
        for (auto& entity : changedEntities) {
            DeltaState delta;
            delta.entityId = entity.id;
            delta.position = entity.position;
            delta.velocity = entity.velocity;
            // ... selective fields
            
            broadcast(delta);
        }
    }
};
```

## SUMMARY

Game Development variant:
1. Performance is paramount - profile everything
2. Determinism for multiplayer and replays
3. Data-oriented design (ECS, SoA)
4. Zero-allocation game loop
5. Asset pipeline for optimized content
6. Authoritative networking with client prediction
7. Comprehensive debugging and profiling tools
8. Memory pools and frame allocators
9. SIMD where beneficial
10. Multi-platform considerations from day one
