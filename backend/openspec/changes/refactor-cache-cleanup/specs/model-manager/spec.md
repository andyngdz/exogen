## ADDED Requirements

### Requirement: Shared Device Cache Cleanup Utility

Model lifecycle components SHALL use a centralized helper for freeing accelerator caches so cache clearing behavior stays consistent across generation, safety, and resource management services.

#### Scenario: GPU cache cleared through helper

- **WHEN** any component needs to free CUDA memory outside of ResourceManager
- **THEN** it SHALL invoke the shared helper which internally calls `torch.cuda.empty_cache()` and logs the cleanup

#### Scenario: MPS fallback handled centrally

- **WHEN** the system runs on Apple Silicon (MPS)
- **THEN** the same helper SHALL call `torch.mps.empty_cache()` so modules do not reimplement device checks
