# Contributing Guide

Thank you for your interest in contributing to this project!

## Development Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd test-task-2-services
   ```

2. **Install pnpm (if not already installed):**
   ```bash
   npm install -g pnpm
   ```

3. **Install dependencies:**
   ```bash
   make install
   # or
   ./setup.sh
   # or manually
   cd service-a && pnpm install
   cd ../service-b && pnpm install
   ```

4. **Start services:**
   ```bash
   make up
   ```

## Code Style

### TypeScript (Services A & B)

- Follow NestJS best practices
- Use TypeScript strict mode
- Use dependency injection
- Write strongly typed code
- Use DTOs for validation
- Document public APIs with Swagger decorators

**Example:**
```typescript
@Injectable()
export class MyService {
  constructor(
    private readonly databaseService: DatabaseService,
  ) {}

  async getData(id: string): Promise<DataDto> {
    // Implementation
  }
}
```

### Go (Report Service)

- Follow Go standard formatting (gofmt)
- Use meaningful variable names
- Write tests for all functions
- Handle errors explicitly
- Document exported functions

**Example:**
```go
// GenerateReport creates a PDF report from time series data
func GenerateReport(ctx context.Context, data []DataPoint) ([]byte, error) {
    // Implementation
}
```

## Project Structure

```
service-a/
├── src/
│   ├── module-name/
│   │   ├── module-name.module.ts
│   │   ├── module-name.controller.ts
│   │   ├── module-name.service.ts
│   │   ├── dto/
│   │   │   └── *.dto.ts
│   │   └── interfaces/
│   │       └── *.interface.ts
```

## Adding New Features

### Adding a New API Endpoint

1. **Create DTO:**
   ```typescript
   // src/module/dto/my-feature.dto.ts
   export class MyFeatureDto {
     @ApiProperty()
     @IsString()
     name: string;
   }
   ```

2. **Add Service Method:**
   ```typescript
   // src/module/module.service.ts
   async myFeature(dto: MyFeatureDto): Promise<Result> {
     // Implementation
   }
   ```

3. **Add Controller Endpoint:**
   ```typescript
   // src/module/module.controller.ts
   @Post('my-feature')
   @ApiOperation({ summary: 'My feature description' })
   async myFeature(@Body() dto: MyFeatureDto) {
     return this.service.myFeature(dto);
   }
   ```

4. **Publish Event:**
   ```typescript
   await this.eventPublisher.publishEvent({
     eventType: 'MY_FEATURE_EXECUTED',
     timestamp: Date.now(),
     serviceId: 'service-a',
     // ... other fields
   });
   ```

### Adding a New Event Type

1. **Update shared types:**
   ```typescript
   // shared/types/events.ts
   export enum EventType {
     // ... existing types
     MY_NEW_EVENT = 'MY_NEW_EVENT',
   }

   export interface MyNewEvent extends BaseEvent {
     eventType: EventType.MY_NEW_EVENT;
     // ... specific fields
   }
   ```

2. **Publish from Service A:**
   ```typescript
   await this.eventPublisher.publishEvent({
     eventType: 'MY_NEW_EVENT',
     // ... fields
   });
   ```

3. **Service B automatically logs it** (no changes needed)

## Testing

### Unit Tests

```typescript
describe('MyService', () => {
  let service: MyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MyService],
    }).compile();

    service = module.get<MyService>(MyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return data', async () => {
    const result = await service.getData('123');
    expect(result).toBeDefined();
  });
});
```

### Integration Tests

Create test files in `test/` directory:

```typescript
describe('API Integration Tests', () => {
  it('should fetch and insert data', async () => {
    // Test implementation
  });
});
```

## Commit Guidelines

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(service-a): add Excel export functionality

- Implement Excel file generation
- Add ExcelJS dependency
- Update API documentation

Closes #123
```

```
fix(service-b): correct PDF chart rendering

Fixed issue where charts were not displaying correctly
in generated PDF reports.

Fixes #456
```

## Pull Request Process

1. **Create a feature branch:**
   ```bash
   git checkout -b feature/my-feature
   ```

2. **Make your changes and commit:**
   ```bash
   git add .
   git commit -m "feat: add my feature"
   ```

3. **Push to your fork:**
   ```bash
   git push origin feature/my-feature
   ```

4. **Create Pull Request:**
   - Provide clear description
   - Reference related issues
   - Add screenshots if applicable
   - Ensure all tests pass

5. **Code Review:**
   - Address review comments
   - Update PR as needed

6. **Merge:**
   - Squash commits if needed
   - Delete feature branch after merge

## Code Review Checklist

- [ ] Code follows project style guidelines
- [ ] All tests pass
- [ ] New tests added for new features
- [ ] Documentation updated
- [ ] No console.log statements (use Logger)
- [ ] Error handling implemented
- [ ] API documented with Swagger
- [ ] Events published where appropriate
- [ ] No hardcoded values (use environment variables)
- [ ] TypeScript types properly defined
- [ ] No any types (unless absolutely necessary)

## Common Issues

### Port Already in Use

```bash
# Find process using port
lsof -i :3000

# Kill process
kill -9 <PID>
```

### MongoDB Connection Failed

```bash
# Check MongoDB is running
docker ps | grep mongodb

# Restart MongoDB
docker-compose restart mongodb
```

### Redis Connection Failed

```bash
# Check Redis is running
docker ps | grep redis

# Restart Redis
docker-compose restart redis
```

## Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [MongoDB Node Driver](https://www.mongodb.com/docs/drivers/node/)
- [Redis Node Client](https://github.com/redis/node-redis)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Docker Compose](https://docs.docker.com/compose/)

## Questions?

If you have questions or need help, please:
1. Check existing documentation
2. Search existing issues
3. Create a new issue with detailed description

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
