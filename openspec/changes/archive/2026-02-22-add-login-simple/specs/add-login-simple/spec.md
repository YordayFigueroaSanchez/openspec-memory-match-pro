## ADDED Requirements

### Requirement: Access control
The application SHALL restrict access to the game board to authenticated users only.

#### Scenario: Unauthenticated user tries to access the game
- **WHEN** an unauthenticated user attempts to navigate to the game board
- **THEN** the application SHALL redirect the user to the login screen

#### Scenario: Authenticated user accesses the game
- **WHEN** a user has successfully logged in
- **THEN** the application SHALL allow the user to view and interact with the game board

### Requirement: Login form
The application SHALL present a login form with fields for username and password and a submit button.

#### Scenario: Empty form submission
- **WHEN** a user submits the login form with empty username or password fields
- **THEN** the application SHALL display a validation error and SHALL NOT attempt authentication

#### Scenario: Form display
- **WHEN** an unauthenticated user navigates to the application
- **THEN** the application SHALL display the login form with username field, password field, and a login button
