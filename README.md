# MCP Hub

<div align="center">

![MCP Hub Logo](https://img.shields.io/badge/MCP-Hub-blue?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)
![Version](https://img.shields.io/badge/version-1.0.0-blue?style=for-the-badge)

**A comprehensive collection of custom MCP (Model Context Protocol) tools and utilities**

[⭐ Star this repo](https://github.com/amani-patrick/mcp-hub) • [🐛 Report Issues](https://github.com/amani-patrick/mcp-hub/issues) • [📖 Documentation](https://github.com/amani-patrick/mcp-hub/wiki)

</div>

## 🚀 About MCP Hub

MCP Hub is a curated collection of custom-built MCP tools and utilities designed to enhance AI model interactions and extend the capabilities of the Model Context Protocol. All tools in this repository are open source and freely available for the community to use, modify, and contribute to.

### ✨ Key Features

- **🛠️ Custom MCP Tools**: A growing collection of specialized tools for various use cases
- **🌐 Modern Web Interface**: Built with React, TypeScript, and Tailwind CSS
- **📚 Comprehensive Documentation**: Detailed guides and API references
- **🔧 Developer Friendly**: Easy setup and contribution process
- **🚀 Production Ready**: Optimized for performance and reliability

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Git

### Installation

This repository is organized as a monorepo containing the **MCP Hub** (web interface) and multiple **MCP Servers** (tools).

#### 1. Running the MCP Hub (Web Interface)

The Hub provides a visual interface to explore documentation for all tools.

```bash
cd mcp-hub
npm install
npm run dev
```
Access the Hub at [http://localhost:8080](http://localhost:8080).

#### 2. Installing Specific MCP Tools

Each tool is a standalone package. To use a tool, navigate to its directory and install dependencies.

**Example: Installing Docker MCP**
```bash
cd docker-mcp
npm install
npm run build
```

**Example: Installing Kubernetes MCP**
```bash
cd kubernetes-mcp
npm install
npm run build
```

Refer to the `README.md` within each tool's directory for specific configuration and usage instructions.

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:dev` - Build for development
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## 📖 Documentation

### 🛠️ Available Tools

Our MCP Hub includes a comprehensive suite of production-ready tools:

- **Kubernetes MCP**: Production-grade interface for safe, bounded Kubernetes operations.
- **Registry MCP**: Secure governance for container registries (Docker Hub, GHCR).
- **Cloud Containers MCP**: Abstracted management for serverless container platforms (AWS ECS).
- **Docker MCP**: Safe, local Docker management for AI agents.
- **API Contract Validator**: Enterprise-grade validation for OpenAPI specs and JSON responses.
- **API Performance Monitor**: Real-time monitoring with SLA tracking and external integrations.
- **Cloud Risk Scanner**: Static analysis for Terraform, Kubernetes, and IAM misconfigurations.
- **Incident Timeline MCP**: Forensic log analysis and automated timeline construction.

### 📚 Learning Resources

- [Getting Started Guide](./docs/getting-started.md)
- [API Documentation](./docs/api.md)
- [Tool Development Guide](./docs/tool-development.md)
- [Best Practices](./docs/best-practices.md)

## 🤝 Contributing

We welcome contributions from the community! Please read our [Contributing Guidelines](./CONTRIBUTING.md) for detailed information on how to get started.

### Quick Contribution Steps

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📋 Development Guidelines

### Code Style

- Use TypeScript for all new code
- Follow ESLint configuration
- Use Prettier for code formatting
- Write meaningful commit messages

### Testing

- Write unit tests for new features
- Ensure all tests pass before submitting PRs
- Maintain test coverage above 80%

## 🐛 Bug Reports

Found a bug? Please create an issue with:

- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Environment details

## 💡 Feature Requests

Have an idea for a new tool or feature? We'd love to hear it! Please:

- Check existing issues first
- Provide detailed description
- Explain the use case
- Consider implementation complexity

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- The MCP Protocol team for the amazing framework
- All contributors who help make this project better
- The open source community for inspiration and tools

## 🔗 Links

- [GitHub Repository](https://github.com/amani-patrick/mcp-hub)
- [Documentation](https://github.com/amani-patrick/mcp-hub/wiki)
- [Issues](https://github.com/amani-patrick/mcp-hub/issues)
- [Discussions](https://github.com/amani-patrick/mcp-hub/discussions)

---

<div align="center">

**Made with ❤️ by [Amani Patrick](https://github.com/amani-patrick)**

[⭐ Star](https://github.com/amani-patrick/mcp-hub) • [🍴 Fork](https://github.com/amani-patrick/mcp-hub/fork) • [📥 Download](https://github.com/amani-patrick/mcp-hub/archive/refs/heads/main.zip)

</div>