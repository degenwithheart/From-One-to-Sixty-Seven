# Variant: Data Science / Machine Learning

> Domain: Analytics, ML pipelines, model training, data engineering
> Focus: Reproducibility, experimentation, scalability, ethics

## Core Principles

### Reproducibility
```python
"""
All experiments must be fully reproducible.

ASSUMPTIONS:
- Random seeds set explicitly
- Dependencies version-pinned
- Data lineage tracked
- Environment containerized
"""

import random
import numpy as np
import torch
from typing import Optional

class ReproducibleExperiment:
    """Base class for reproducible ML experiments."""
    
    def __init__(self, seed: int = 42, name: str = "experiment"):
        self.seed = seed
        self.name = name
        self.metadata = {
            "seed": seed,
            "pytorch_version": torch.__version__,
            "numpy_version": np.__version__,
        }
        self._set_seed()
    
    def _set_seed(self) -> None:
        """Set all random seeds for reproducibility."""
        random.seed(self.seed)
        np.random.seed(self.seed)
        torch.manual_seed(self.seed)
        
        if torch.cuda.is_available():
            torch.cuda.manual_seed_all(self.seed)
            # Deterministic algorithms (slower but reproducible)
            torch.backends.cudnn.deterministic = True
            torch.backends.cudnn.benchmark = False
    
    def log_params(self, params: dict) -> None:
        """Log hyperparameters for experiment tracking."""
        self.metadata["parameters"] = params
        
        # Log to MLflow / Weights & Biases
        if mlflow.active_run():
            mlflow.log_params(params)


# Usage
experiment = ReproducibleExperiment(seed=2024, name="transformer-v1")
experiment.log_params({
    "learning_rate": 1e-4,
    "batch_size": 32,
    "epochs": 100,
})
```

### Data Pipeline
```python
"""
Data processing with validation and lineage.

ASSUMPTIONS:
- Data schema validated at each step
- Transformations are pure functions
- Intermediate results cached
"""

import pandas as pd
from pandera import DataFrameSchema, Column, Check
from typing import Callable

# Define data schema
raw_data_schema = DataFrameSchema({
    "user_id": Column(int, Check.greater_than(0)),
    "timestamp": Column("datetime64[ns]"),
    "feature_1": Column(float, Check.in_range(-10, 10)),
    "feature_2": Column(float, nullable=True),
    "target": Column(int, Check.isin([0, 1])),
})

class DataPipeline:
    """Reproducible data processing pipeline."""
    
    def __init__(self, steps: list[Callable]):
        self.steps = steps
        self.lineage: list[dict] = []
    
    def process(self, df: pd.DataFrame) -> pd.DataFrame:
        """Apply all transformation steps with validation."""
        # Validate input
        raw_data_schema.validate(df)
        
        for step in self.steps:
            step_name = step.__name__
            
            # Track lineage
            input_hash = self._compute_hash(df)
            df = step(df)
            output_hash = self._compute_hash(df)
            
            self.lineage.append({
                "step": step_name,
                "input_rows": len(df),
                "input_hash": input_hash,
                "output_hash": output_hash,
            })
        
        return df
    
    @staticmethod
    def _compute_hash(df: pd.DataFrame) -> str:
        """Compute deterministic hash for data versioning."""
        import hashlib
        return hashlib.md5(
            pd.util.hash_pandas_object(df).values.tobytes()
        ).hexdigest()[:16]


# Pure transformation functions
def remove_outliers(df: pd.DataFrame) -> pd.DataFrame:
    """Remove statistical outliers using IQR method."""
    Q1 = df.quantile(0.25)
    Q3 = df.quantile(0.75)
    IQR = Q3 - Q1
    
    mask = ~((df < (Q1 - 1.5 * IQR)) | (df > (Q3 + 1.5 * IQR))).any(axis=1)
    return df[mask]

def normalize_features(df: pd.DataFrame) -> pd.DataFrame:
    """Z-score normalization."""
    from sklearn.preprocessing import StandardScaler
    
    features = df.select_dtypes(include=[np.number]).columns
    scaler = StandardScaler()
    df[features] = scaler.fit_transform(df[features])
    
    return df

# Build pipeline
pipeline = DataPipeline([
    remove_outliers,
    normalize_features,
])
```

### Model Training
```python
"""
Training with comprehensive logging and checkpointing.

SECURITY NOTE:
- No sensitive data logged
- Model artifacts versioned
- Access controls on model registry
"""

import torch.nn as nn
from torch.utils.tensorboard import SummaryWriter
from typing import Dict, Any

class Trainer:
    """Reproducible model training."""
    
    def __init__(
        self,
        model: nn.Module,
        experiment: ReproducibleExperiment,
        checkpoint_dir: Path,
    ):
        self.model = model
        self.experiment = experiment
        self.checkpoint_dir = Path(checkpoint_dir)
        self.writer = SummaryWriter(log_dir=f"runs/{experiment.name}")
        self.best_metric = float('inf')
    
    def train_epoch(self, dataloader) -> Dict[str, float]:
        """Train for one epoch."""
        self.model.train()
        total_loss = 0.0
        
        for batch_idx, (data, target) in enumerate(dataloader):
            self.optimizer.zero_grad()
            output = self.model(data)
            loss = self.criterion(output, target)
            loss.backward()
            
            # Gradient clipping for stability
            torch.nn.utils.clip_grad_norm_(self.model.parameters(), max_norm=1.0)
            
            self.optimizer.step()
            total_loss += loss.item()
        
        return {"loss": total_loss / len(dataloader)}
    
    def validate(self, dataloader) -> Dict[str, float]:
        """Validation loop."""
        self.model.eval()
        total_loss = 0.0
        correct = 0
        
        with torch.no_grad():
            for data, target in dataloader:
                output = self.model(data)
                total_loss += self.criterion(output, target).item()
                pred = output.argmax(dim=1)
                correct += pred.eq(target).sum().item()
        
        accuracy = correct / len(dataloader.dataset)
        
        return {
            "loss": total_loss / len(dataloader),
            "accuracy": accuracy,
        }
    
    def save_checkpoint(self, epoch: int, metrics: Dict[str, float]) -> None:
        """Save model checkpoint."""
        is_best = metrics.get("val_loss", float('inf')) < self.best_metric
        
        checkpoint = {
            "epoch": epoch,
            "model_state_dict": self.model.state_dict(),
            "optimizer_state_dict": self.optimizer.state_dict(),
            "metrics": metrics,
            "experiment_metadata": self.experiment.metadata,
        }
        
        path = self.checkpoint_dir / f"checkpoint_epoch_{epoch}.pt"
        torch.save(checkpoint, path)
        
        if is_best:
            best_path = self.checkpoint_dir / "best_model.pt"
            torch.save(checkpoint, best_path)
            self.best_metric = metrics["val_loss"]
            
            # Log to model registry
            mlflow.log_artifact(str(best_path))
```

### Experiment Tracking
```python
"""
Comprehensive experiment tracking with MLflow.

ASSUMPTIONS:
- All metrics logged to centralized tracking server
- Artifacts stored in object storage
- Experiments searchable and comparable
"""

import mlflow
import mlflow.pytorch
from contextlib import contextmanager

@contextmanager
def tracked_experiment(name: str, tags: Optional[Dict] = None):
    """
    Context manager for tracked experiments.
    
    ASSUMPTIONS:
    - MLflow server configured
    - Authentication tokens available
    """
    mlflow.set_experiment(name)
    
    with mlflow.start_run():
        if tags:
            mlflow.set_tags(tags)
        
        try:
            yield mlflow.active_run()
        finally:
            # Always log system metrics
            mlflow.log_metrics({
                "system.cpu_percent": psutil.cpu_percent(),
                "system.memory_percent": psutil.virtual_memory().percent,
            })

# Usage
with tracked_experiment("fraud-detection", tags={"version": "v2", "team": "risk"}):
    model = train_model(config)
    
    # Log model
    mlflow.pytorch.log_model(model, "model")
    
    # Log metrics
    mlflow.log_metrics({
        "accuracy": 0.94,
        "precision": 0.91,
        "recall": 0.89,
        "f1": 0.90,
    })
    
    # Log dataset info
    mlflow.log_params({
        "dataset_version": "2024-01-15",
        "training_samples": 100000,
        "features": 47,
    })
```

### Model Evaluation
```python
"""
Comprehensive model evaluation with bias detection.

SECURITY NOTE:
- Evaluate for fairness across demographic groups
- Document model limitations
- Test for adversarial robustness
"""

from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    classification_report, confusion_matrix
)
import pandas as pd

class ModelEvaluator:
    """Comprehensive model evaluation."""
    
    def evaluate(
        self,
        model,
        X_test: pd.DataFrame,
        y_test: pd.Series,
        sensitive_attrs: Optional[list[str]] = None,
    ) -> Dict[str, Any]:
        """
        Evaluate model with fairness metrics.
        
        ASSUMPTIONS:
        - Test set held out from training
        - Sensitive attributes available for fairness audit
        """
        predictions = model.predict(X_test)
        
        # Overall metrics
        metrics = {
            "accuracy": accuracy_score(y_test, predictions),
            "precision": precision_score(y_test, predictions, average='weighted'),
            "recall": recall_score(y_test, predictions, average='weighted'),
            "f1": f1_score(y_test, predictions, average='weighted'),
        }
        
        # Fairness evaluation across groups
        if sensitive_attrs:
            fairness_metrics = {}
            
            for attr in sensitive_attrs:
                group_metrics = {}
                for group in X_test[attr].unique():
                    mask = X_test[attr] == group
                    group_preds = predictions[mask]
                    group_true = y_test[mask]
                    
                    group_metrics[group] = {
                        "accuracy": accuracy_score(group_true, group_preds),
                        "count": len(group_true),
                    }
                
                # Demographic parity check
                accuracies = [m["accuracy"] for m in group_metrics.values()]
                parity_gap = max(accuracies) - min(accuracies)
                
                fairness_metrics[attr] = {
                    "groups": group_metrics,
                    "parity_gap": parity_gap,
                    "fair": parity_gap < 0.05,  # 5% threshold
                }
            
            metrics["fairness"] = fairness_metrics
        
        # Confusion matrix
        metrics["confusion_matrix"] = confusion_matrix(y_test, predictions).tolist()
        
        return metrics
    
    def generate_report(self, metrics: Dict) -> str:
        """Generate markdown evaluation report."""
        report = f"""
# Model Evaluation Report

## Overall Performance
- Accuracy: {metrics['accuracy']:.3f}
- Precision: {metrics['precision']:.3f}
- Recall: {metrics['recall']:.3f}
- F1 Score: {metrics['f1']:.3f}

## Fairness Analysis
"""
        if 'fairness' in metrics:
            for attr, fairness in metrics['fairness'].items():
                report += f"\n### {attr}\n"
                report += f"- Parity Gap: {fairness['parity_gap']:.3f}\n"
                report += f"- Status: {'✅ FAIR' if fairness['fair'] else '⚠️ BIAS DETECTED'}\n"
                
                for group, group_metrics in fairness['groups'].items():
                    report += f"- {group}: {group_metrics['accuracy']:.3f} (n={group_metrics['count']})\n"
        
        return report
```

## SUMMARY

Data Science / ML variant:
1. Reproducibility with fixed seeds and versioning
2. Data lineage tracking and validation
3. Pure transformation functions in pipelines
4. Comprehensive experiment tracking
5. Model versioning and registry
6. Fairness and bias evaluation
7. Containerized environments
8. Automated model testing
9. Audit logging for compliance
10. Documentation of model limitations
