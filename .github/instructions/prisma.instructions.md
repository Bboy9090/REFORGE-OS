---
applyTo:
  - "**/prisma/**"
  - "**/*.prisma"
  - "**/migrations/**"
---

# Prisma Schema & Migration Rules

## Prime Directive

**MIGRATIONS ARE IRREVERSIBLE IN PRODUCTION. MEASURE TWICE, CUT ONCE.**

## Core Requirements

### 1. Schema Changes

- **Never delete columns without a migration plan**
  1. First PR: Mark as optional, stop writing to it
  2. Second PR (later): Remove from code, deploy
  3. Third PR (much later): Drop column in migration

- **Always add new columns as optional first**
  ```prisma
  // ✅ GOOD - Optional first
  model Device {
    id        String   @id @default(cuid())
    name      String
    firmware  String?  // New column, optional
  }
  ```

- **Use sensible defaults for new required columns**
  ```prisma
  // ✅ GOOD - Default value provided
  model Device {
    id        String   @id @default(cuid())
    name      String
    status    String   @default("active")  // New required with default
  }
  ```

### 2. Migration Discipline

- **Always review generated migrations before applying**
  ```bash
  # Generate migration
  npx prisma migrate dev --name add_device_status
  
  # Review SQL in prisma/migrations/XXX_add_device_status/migration.sql
  # Verify it does what you expect
  
  # Then apply
  npx prisma migrate deploy
  ```

- **Name migrations descriptively**
  ```bash
  # ❌ BAD
  npx prisma migrate dev --name update
  
  # ✅ GOOD
  npx prisma migrate dev --name add_device_firmware_version_tracking
  ```

- **Test migrations on dev database first**
  - Apply to local dev DB
  - Verify data integrity
  - Test rollback (if possible)
  - Then apply to staging
  - Then production

### 3. Rollback Planning

- **Every migration needs a rollback strategy**
  - Document in PR description
  - Keep rollback SQL in PR comments
  - Test rollback on dev database

Example rollback notes:
```sql
-- Migration: add_device_firmware_column
-- Forward: ALTER TABLE Device ADD COLUMN firmware TEXT;
-- Rollback: ALTER TABLE Device DROP COLUMN firmware;
-- Safe to rollback: YES (if no data written yet)
-- Safe to rollback: NO (after data written - will lose data)
```

### 4. Dangerous Operations

**The following require extra care:**

- **Dropping tables** → Could lose data forever
- **Dropping columns** → Could lose data forever
- **Changing column types** → Could truncate data
- **Adding NOT NULL to existing column** → Could fail if NULLs exist
- **Adding unique constraints** → Could fail if duplicates exist
- **Renaming** → Breaking change for existing code

**Process for dangerous operations:**
1. Announce in team chat/PR
2. Backup database before applying
3. Apply during maintenance window
4. Monitor for errors immediately after
5. Have rollback plan ready

### 5. Data Migrations

- **Separate schema changes from data changes**
  ```bash
  # First migration: Add column
  npx prisma migrate dev --name add_device_status_column
  
  # Then: Write script to populate data
  # scripts/migrate-device-status.ts
  
  # Then: Make column required (if needed)
  npx prisma migrate dev --name make_device_status_required
  ```

- **Use idempotent data migration scripts**
  ```typescript
  // ✅ GOOD - Can run multiple times safely
  async function migrateDeviceStatus() {
    const devices = await prisma.device.findMany({
      where: { status: null }  // Only update nulls
    });
    
    for (const device of devices) {
      await prisma.device.update({
        where: { id: device.id },
        data: { status: 'unknown' }
      });
    }
  }
  ```

### 6. Schema Validation

- **Always run `prisma validate` before committing**
  ```bash
  npx prisma validate
  ```

- **Ensure schema matches database**
  ```bash
  # Check for drift
  npx prisma migrate status
  
  # If drift detected, investigate before proceeding
  ```

### 7. Index Strategy

- **Add indexes for frequently queried fields**
  ```prisma
  model Device {
    id       String   @id @default(cuid())
    serialNo String   @unique          // Implicit index
    ownerId  String
    status   String
    
    @@index([ownerId])              // Explicit index
    @@index([status, ownerId])      // Composite index
  }
  ```

- **Don't over-index** (slows writes, uses space)
- **Monitor query performance** (use EXPLAIN in production)

### 8. Relations

- **Always specify both sides of relation**
  ```prisma
  model User {
    id      String   @id @default(cuid())
    devices Device[]
  }
  
  model Device {
    id      String @id @default(cuid())
    ownerId String
    owner   User   @relation(fields: [ownerId], references: [id])
  }
  ```

- **Use cascade deletes carefully**
  ```prisma
  // ⚠️ CAREFUL - Deleting user deletes all devices
  model Device {
    id      String @id @default(cuid())
    ownerId String
    owner   User   @relation(fields: [ownerId], references: [id], onDelete: Cascade)
  }
  
  // ✅ SAFER - Prevent deletion if devices exist
  model Device {
    id      String @id @default(cuid())
    ownerId String
    owner   User   @relation(fields: [ownerId], references: [id], onDelete: Restrict)
  }
  ```

### 9. Enums

- **Use enums for fixed sets of values**
  ```prisma
  enum DeviceStatus {
    ACTIVE
    INACTIVE
    FLASHING
    ERROR
  }
  
  model Device {
    id     String       @id @default(cuid())
    status DeviceStatus @default(ACTIVE)
  }
  ```

- **Changing enums requires migration**
  - Adding values: Usually safe
  - Removing values: Check for usage first
  - Renaming: Breaking change

### 10. Testing

- **Test migrations in isolated environment**
  ```bash
  # Use test database
  DATABASE_URL="postgresql://localhost:5432/test_db" npx prisma migrate dev
  
  # Verify
  DATABASE_URL="postgresql://localhost:5432/test_db" npx prisma studio
  ```

- **Write integration tests for complex migrations**
- **Verify data integrity after migration**

## Pre-Commit Checklist

- [ ] `npx prisma validate` passes
- [ ] Migration tested on local dev database
- [ ] Rollback strategy documented
- [ ] Breaking changes announced to team
- [ ] Data migration script written (if needed)
- [ ] Indexes added for new query patterns
- [ ] Relations properly defined on both sides
- [ ] No destructive operations without backup plan
- [ ] Migration name is descriptive
- [ ] PR description explains migration impact

## Common Mistakes to Avoid

1. **Direct database changes** (always use migrations)
2. **Forgetting to generate client** after schema changes
3. **Not testing migrations before applying**
4. **Adding required columns without defaults**
5. **Dropping columns prematurely** (before code updated everywhere)
6. **Changing types without data validation**
7. **Not backing up before dangerous operations**

## Emergency Procedures

### If Migration Fails in Production

1. **Don't panic** - Assess the situation
2. **Check error logs** - Understand what failed
3. **Rollback if possible** - Use documented rollback SQL
4. **If rollback not possible** - Fix forward with new migration
5. **Communicate** - Keep team/stakeholders informed
6. **Post-mortem** - Document what happened and how to prevent

### If Data Lost

1. **Restore from backup** (you do have backups, right?)
2. **Assess data loss scope**
3. **Notify affected users** (if applicable)
4. **Document incident**
5. **Improve backup/recovery procedures**

## Additional Resources

- [Prisma Migration Guide](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Prisma Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization)
- Team wiki (if available) for project-specific conventions
