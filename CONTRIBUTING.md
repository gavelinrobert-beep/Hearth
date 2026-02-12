# Contributing to NoIDchat

First off, thank you for considering contributing to NoIDchat! It's people like you that make NoIDchat such a great tool.

## Code of Conduct

By participating in this project, you are expected to uphold our Code of Conduct:
- Be respectful and inclusive
- Be patient and welcoming
- Be collaborative
- Focus on what is best for the community

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When creating a bug report, include:

- A clear and descriptive title
- Steps to reproduce the issue
- Expected behavior
- Actual behavior
- Screenshots if applicable
- Your environment (OS, Node version, etc.)

### Suggesting Enhancements

Enhancement suggestions are welcome! Please provide:

- A clear and descriptive title
- Detailed explanation of the suggested enhancement
- Why this enhancement would be useful
- Examples of how it would work

### Pull Requests

1. Fork the repository
2. Create a new branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests if available
5. Commit your changes (`git commit -m 'Add some amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

#### Pull Request Guidelines

- Follow the existing code style
- Write clear commit messages
- Update documentation as needed
- Add tests for new features
- Ensure all tests pass
- Keep pull requests focused on a single feature or bug fix

## Development Setup

1. Clone the repository
```bash
git clone https://github.com/gavelinrobert-beep/NoIDchat.git
cd NoIDchat
```

2. Install dependencies
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

3. Set up environment variables
```bash
cp backend/.env.example backend/.env
# Edit backend/.env with your configuration
```

4. Run the development servers
```bash
# Backend
cd backend
npm run dev

# Frontend (in another terminal)
cd frontend
npm run dev
```

## Code Style

- Use TypeScript for type safety
- Follow existing naming conventions
- Write meaningful variable and function names
- Comment complex logic
- Keep functions small and focused
- Use async/await over callbacks

## Testing

- Write tests for new features
- Ensure existing tests pass
- Aim for good test coverage

## Documentation

- Update README.md if you change functionality
- Comment your code where necessary
- Update API documentation for new endpoints

## Questions?

Feel free to open an issue with your question or reach out to the maintainers.

Thank you for contributing! 🎉
