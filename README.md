# Wedding Wishes API

A modern RESTful API built with Elysia.js and Bun runtime for managing wedding wishes and attendance.

## 🚀 Getting Started

### Prerequisites
- [Bun](https://bun.sh) >= 1.0.0
- [PostgreSQL](https://www.postgresql.org/) >= 14.0
- [Node.js](https://nodejs.org/) >= 18.0.0 (for some development tools)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/mrofisr/wedding-backend.git
cd wedding-backend
```
2. Install dependencies:
```bash
bun install
```
3. Set up environment variables:
```bash
cp .env.example .env
```
4. Update the .env file with your configuration:
```bash
DATABASE_URL="postgresql://mrofisr:password@localhost:5432/wedding_wishes_db?schema=public"
```
5. Initialize the database:
```bash
bunx prisma generate
bunx prisma migrate dev
```

## 🔧 Development

Start the development server:
```bash
bun run dev
```

The API will be available at http://localhost:3000

## API Documentation

- Swagger UI: http://localhost:3000/swagger
- API Health Check: http://localhost:3000/health

## 🙏 Acknowledgments

- [Elysia.js](https://elysiajs.com/)
- [Bun](https://bun.sh)
- [Prisma](https://www.prisma.io/)
- [PostgreSQL (Neon Tech)](https://neon.tech/)

## 📞 Contact
- GitHub: [@mrofisr](https://github.com/mrofisr)