# React Application Development Rules

This project follows industry-standard React best practices. All cursor agents must adhere to these rules when implementing features or making changes.

## Rule Organization

These rules are organized into separate files for better maintainability:
- `.cursorrules/01-project-structure.md` - File and folder organization
- `.cursorrules/02-component-patterns.md` - Component design and organization
- `.cursorrules/03-state-management.md` - State management patterns
- `.cursorrules/04-code-quality.md` - Code quality and best practices
- `.cursorrules/05-testing.md` - Testing standards
- `.cursorrules/06-performance.md` - Performance optimization
- `.cursorrules/07-naming-conventions.md` - Naming conventions

## Core Principles

1. **Feature-Based Organization**: Organize code by features, not file types
2. **Co-location**: Keep related files together (components, styles, tests)
3. **Single Responsibility**: Each component/hook/function should have one clear purpose
4. **Separation of Concerns**: Separate business logic from UI components
5. **TypeScript First**: Use TypeScript for type safety (if TypeScript is configured)
6. **Performance Conscious**: Consider performance implications in all implementations
7. **Testability**: Write code that is easy to test

## Before Implementing Any Feature

1. Review the relevant rule files in `.cursorrules/` directory
2. Follow the project structure defined in `01-project-structure.md`
3. Ensure component patterns match `02-component-patterns.md`
4. Use appropriate state management from `03-state-management.md`
5. Write tests following `05-testing.md` guidelines
6. Apply naming conventions from `07-naming-conventions.md`

## Quick Reference

- Components: PascalCase, co-located with styles/tests
- Hooks: camelCase starting with "use"
- Utilities: camelCase
- Files/Folders: kebab-case (preferred) or camelCase
- Feature structure: `src/features/[feature-name]/`
- Shared components: `src/shared/components/`

