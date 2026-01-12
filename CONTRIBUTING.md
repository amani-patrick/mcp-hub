# Contributing to MCP Hub

Thank you for your interest in contributing to MCP Hub! We welcome contributions from everyone, whether you're a beginner or an experienced developer. This guide will help you get started.

## 🚀 Getting Started

### Prerequisites

Before you start contributing, make sure you have:

- **Node.js 18+** and npm installed
- **Git** for version control
- A **GitHub account** 
- A code editor (we recommend [VS Code](https://code.visualstudio.com/))

### Development Setup

#### 1. Fork and Clone
```bash
git clone https://github.com/YOUR_USERNAME/mcp-hub.git
cd mcp-hub
```

#### 2. Setting up the Hub (Frontend)
To work on the `mcp-hub` web interface:
```bash
cd mcp-hub
npm install
npm run dev
```
Open [http://localhost:8080](http://localhost:8080) to verify.

#### 3. Working on an MCP Tool
To work on a specific tool (e.g., `docker-mcp`):
```bash
cd docker-mcp
npm install
npm run build
# Run tests if available
npm test
```

## 📋 How to Contribute

### 🐛 Reporting Bugs

Found a bug? Please create an issue with the following information:

**Required Information:**
- **Clear title** describing the bug
- **Detailed description** of the problem
- **Steps to reproduce** the issue
- **Expected behavior** vs **actual behavior**
- **Environment details** (OS, Node.js version, browser)
- **Screenshots** if applicable

**Bug Report Template:**
```markdown
## Bug Description
Brief description of the bug

## Steps to Reproduce
1. Go to...
2. Click on...
3. See error

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- OS: [e.g., Windows 11, macOS 13.0]
- Node.js: [e.g., 18.17.0]
- Browser: [e.g., Chrome 118]

## Additional Context
Any other relevant information
```

### 💡 Suggesting Features

Have an idea for a new feature? We'd love to hear it!

**Feature Request Template:**
```markdown
## Feature Description
Clear description of the proposed feature

## Problem Statement
What problem does this feature solve?

## Proposed Solution
How should this feature work?

## Alternatives Considered
Other approaches you've thought about

## Additional Context
Any other relevant information
```

### 🔧 Code Contributions

We welcome code contributions! Here's how to get started:

#### 1. Choose an Issue
- Look for issues labeled `good first issue` for beginners
- Check `help wanted` for contributions we need
- Or create a new issue for your idea

#### 2. Create a Branch
```bash
# Make sure your main branch is up to date
git checkout main
git pull upstream main

# Create a new branch for your feature
git checkout -b feature/your-feature-name
# or for a bug fix
git checkout -b fix/your-bug-fix
```

#### 3. Make Your Changes
- Follow our [Code Style Guidelines](#code-style)
- Write tests for new functionality
- Update documentation if needed
- Commit your changes with [good commit messages](#commit-messages)

#### 4. Test Your Changes
```bash
# Run linting
npm run lint

# Run tests (when available)
npm test

# Build the project
npm run build
```

#### 5. Submit Your Pull Request
```bash
# Push your branch to your fork
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub with:
- Clear title and description
- Reference any related issues
- Screenshots if UI changes
- Testing instructions

## 📝 Development Guidelines

### Code Style

We use automated tools to maintain code quality:

#### ESLint Configuration
- Run `npm run lint` to check code style
- Fix issues automatically with `npm run lint:fix`

#### TypeScript
- All new code must be written in TypeScript
- Use proper type definitions
- Avoid `any` types when possible

#### Component Structure
```tsx
// Example component structure
import React from 'react';
import { cn } from '@/lib/utils';

interface ComponentProps {
  className?: string;
  children: React.ReactNode;
}

const Component: React.FC<ComponentProps> = ({ 
  className, 
  children 
}) => {
  return (
    <div className={cn('default-styles', className)}>
      {children}
    </div>
  );
};

export default Component;
```

### File Naming Conventions

- **Components**: PascalCase (`UserProfile.tsx`)
- **Utilities**: camelCase (`formatDate.ts`)
- **Constants**: UPPER_SNAKE_CASE (`API_ENDPOINTS.ts`)
- **Types**: PascalCase with `.types.ts` suffix (`User.types.ts`)

### Import Order

```tsx
// 1. React imports
import React from 'react';

// 2. Third-party libraries
import { useRouter } from 'next/router';

// 3. Internal imports (absolute paths)
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';

// 4. Relative imports
import { ChildComponent } from './ChildComponent';
```

## 🧪 Testing

### Writing Tests

- Write unit tests for new functions and components
- Test both happy paths and edge cases
- Use descriptive test names

```tsx
// Example test
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/button';

describe('Button Component', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    screen.getByRole('button').click();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test:watch

# Run tests with coverage
npm test:coverage
```

## 📖 Documentation

### Updating Documentation

When adding new features or making changes:
- Update relevant sections in README.md
- Add inline code comments for complex logic
- Update API documentation if needed
- Add examples for new components

### Documentation Style

- Use clear, concise language
- Include code examples
- Use proper markdown formatting
- Add screenshots for UI changes

## 🔄 Git Workflow

### Branch Naming

- `feature/feature-name` for new features
- `fix/bug-description` for bug fixes
- `docs/documentation-update` for documentation changes
- `refactor/code-cleanup` for refactoring

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(tools): add new API validator tool

fix(components): resolve button hover state issue

docs(readme): update installation instructions
```

### Pull Request Process

1. **Before Creating PR**
   - Ensure your branch is up to date with main
   - Run all tests and linting
   - Test your changes thoroughly
   - Update documentation

2. **Creating PR**
   - Use clear, descriptive title
   - Fill out the PR template completely
   - Link related issues
   - Add screenshots for UI changes

3. **PR Template**
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] All tests pass
- [ ] Manual testing completed
- [ ] Added new tests

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No merge conflicts
```

## 🏷️ Issue Labels

We use these labels to categorize issues:

- `good first issue` - Great for newcomers
- `help wanted` - Community contributions welcome
- `bug` - Bug reports
- `enhancement` - Feature requests
- `documentation` - Documentation improvements
- `priority/high` - High priority issues
- `priority/medium` - Medium priority issues
- `priority/low` - Low priority issues

## 🎯 Areas Where We Need Help

### Current Priorities

1. **Testing**: Help us improve test coverage
2. **Documentation**: Improve guides and API docs
3. **New Tools**: Develop additional MCP tools
4. **UI/UX**: Improve the user interface
5. **Performance**: Optimize application performance

### Adding a New Tool

To add a new MCP tool to this repository:

1.  **Create Directory**: Create a new directory for your tool (e.g., `my-new-tool-mcp`).
2.  **Initialize**: Set up `package.json` and `tsconfig.json`.
3.  **Implement**: Build your MCP server using `@modelcontextprotocol/sdk`.
4.  **Register**: Add your tool's metadata to `mcp-hub/src/data/tools.tsx` so it appears in the frontend.
5.  **Document**: Add a `README.md` in your tool's directory.

### Tool Development Ideas

We're looking for contributions in these areas:
- Database connectors (PostgreSQL, Redis)
- Cloud provider integrations (Azure, GCP)
- Developer productivity tools
- Security analysis tools

## 🤝 Community Guidelines

### Code of Conduct

We are committed to providing a welcoming and inclusive environment. Please:

- Be respectful and considerate
- Use inclusive language
- Focus on constructive feedback
- Help others learn and grow

### Getting Help

- **Discussions**: Use GitHub Discussions for questions
- **Issues**: Use issues for bugs and feature requests
- **Discord**: Join our community Discord (link in README)

## 🏆 Recognition

### Contributors

All contributors are recognized in:
- README.md contributors section
- Release notes
- Annual community highlights

### Types of Contributions

We value all types of contributions:
- Code contributions
- Documentation improvements
- Bug reports and triage
- Community support
- Design and UX feedback

## 📞 Getting in Touch

- **GitHub Issues**: [Create an issue](https://github.com/amani-patrick/mcp-hub/issues)
- **GitHub Discussions**: [Start a discussion](https://github.com/amani-patrick/mcp-hub/discussions)
- **Email**: [amani.patrick@example.com](mailto:amani.patrick@example.com)

## 📚 Additional Resources

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)
- [Vite Documentation](https://vitejs.dev/)

---

Thank you for contributing to MCP Hub! Your contributions help make this project better for everyone. 🎉

If you have any questions or need help getting started, don't hesitate to reach out.
