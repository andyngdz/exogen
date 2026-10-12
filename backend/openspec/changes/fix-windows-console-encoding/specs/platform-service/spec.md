## ADDED Requirements

### Requirement: UTF-8 Console Encoding on Windows

The platform service SHALL configure `sys.stdout` and `sys.stderr` to use UTF-8 encoding on Windows to prevent `UnicodeEncodeError` when third-party libraries print Unicode characters.

#### Scenario: Console handles Unicode progress bar characters

- **WHEN** the platform is Windows
- **AND** `PlatformService.init()` is called
- **THEN** `sys.stdout` and `sys.stderr` are reconfigured to use UTF-8 encoding
- **AND** Unicode characters like `█` can be printed without raising encoding errors

#### Scenario: Non-Windows platforms are unaffected

- **WHEN** the platform is not Windows
- **AND** `PlatformService.init()` is called
- **THEN** `sys.stdout` and `sys.stderr` remain unchanged
