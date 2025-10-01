# 🚀 ESLint Quick Reference Card

## 📦 Available Lint Commands

| Command | Mode | Description | Use Case |
|---------|------|-------------|----------|
| `npm run lint` | Standard | Check errors with warnings | Daily development |
| `npm run lint:fix` | Standard | Auto-fix issues | Quick fixes |
| `npm run lint:strict` | Standard | No warnings allowed | Pre-commit |
| `npm run lint:enterprise` | **Enterprise** | Maximum strictness | Production/CI |
| `npm run lint:enterprise:fix` | **Enterprise** | Auto-fix strict mode | Cleanup code |
| `npm run lint:check` | Standard | Detailed report | Code review |

---

## 🎯 Top 20 Most Common Errors & Fixes

### 1. **no-unused-vars** 🔴
```javascript
// ❌ ERROR
const unused = "value";

// ✅ FIX
const used = "value";
console.log(used);

// OR remove it
```

### 2. **no-var** 🔴
```javascript
// ❌ ERROR
var name = "John";

// ✅ FIX
const name = "John";
// OR
let name = "John"; // if reassigning
```

### 3. **prefer-const** 🔴
```javascript
// ❌ ERROR
let name = "John";
console.log(name);

// ✅ FIX - Use const if not reassigned
const name = "John";
console.log(name);
```

### 4. **eqeqeq** 🔴
```javascript
// ❌ ERROR
if (user == null) {}

// ✅ FIX
if (user === null) {}
```

### 5. **react/jsx-key** 🔴
```javascript
// ❌ ERROR
{items.map(item => <div>{item}</div>)}

// ✅ FIX
{items.map(item => <div key={item.id}>{item}</div>)}
```

### 6. **react-hooks/exhaustive-deps** 🔴
```javascript
// ❌ ERROR
useEffect(() => {
  doSomething(value);
}, []); // Missing dependency

// ✅ FIX
useEffect(() => {
  doSomething(value);
}, [value]);
```

### 7. **@next/next/no-img-element** 🔴
```javascript
// ❌ ERROR
<img src="/logo.png" alt="Logo" />

// ✅ FIX
import Image from 'next/image';
<Image src="/logo.png" width={100} height={100} alt="Logo" />
```

### 8. **no-console** (Enterprise Mode) 🔴
```javascript
// ❌ ERROR (in enterprise mode)
console.log("Debug");

// ✅ FIX - Remove or use logger
// Remove for production
// OR use proper logging library
```

### 9. **prefer-template** 🔴
```javascript
// ❌ ERROR
const msg = "Hello " + name + "!";

// ✅ FIX
const msg = `Hello ${name}!`;
```

### 10. **object-shorthand** 🔴
```javascript
// ❌ ERROR
const obj = { x: x, y: y };

// ✅ FIX
const obj = { x, y };
```

### 11. **arrow-body-style** 🔴
```javascript
// ❌ ERROR
const double = (x) => { return x * 2; };

// ✅ FIX
const double = (x) => x * 2;
```

### 12. **no-duplicate-imports** 🔴
```javascript
// ❌ ERROR
import { a } from 'module';
import { b } from 'module';

// ✅ FIX
import { a, b } from 'module';
```

### 13. **require-await** 🔴
```javascript
// ❌ ERROR
async function noAwait() {
  return "done";
}

// ✅ FIX - Remove async
function noAwait() {
  return "done";
}

// OR add await
async function withAwait() {
  return await fetchData();
}
```

### 14. **no-await-in-loop** 🔴
```javascript
// ❌ ERROR
for (const item of items) {
  await process(item);
}

// ✅ FIX
await Promise.all(items.map(item => process(item)));
```

### 15. **prefer-destructuring** 🔴
```javascript
// ❌ ERROR
const name = user.name;
const email = user.email;

// ✅ FIX
const { name, email } = user;
```

### 16. **no-useless-catch** 🔴
```javascript
// ❌ ERROR
try {
  riskyCode();
} catch (error) {
  throw error; // Useless
}

// ✅ FIX
try {
  riskyCode();
} catch (error) {
  console.error("Error:", error);
  throw new Error("Custom message");
}
```

### 17. **no-throw-literal** 🔴
```javascript
// ❌ ERROR
throw "Something went wrong";

// ✅ FIX
throw new Error("Something went wrong");
```

### 18. **semi** 🔴
```javascript
// ❌ ERROR
const x = 5

// ✅ FIX
const x = 5;
```

### 19. **quotes** 🔴
```javascript
// ❌ ERROR
const name = 'John';

// ✅ FIX
const name = "John";
```

### 20. **no-shadow** 🔴
```javascript
// ❌ ERROR
const name = "John";
function test() {
  const name = "Jane"; // Shadowing
}

// ✅ FIX
const name = "John";
function test() {
  const userName = "Jane"; // Different name
}
```

---

## 🛠️ Quick Fix Shortcuts

### Fix Single Issue
```bash
# On the error line
// eslint-disable-next-line no-console
console.log("This is okay");
```

### Fix Entire File
```bash
# At top of file
/* eslint-disable no-console */

// Your code here
console.log("All console.log allowed in this file");
```

### Fix Specific File
```bash
npx eslint path/to/file.jsx --fix
```

### Auto-Fix All
```bash
npm run lint:fix
```

---

## 🎨 VS Code Integration

### Enable/Disable Auto-Fix on Save

**.vscode/settings.json:**
```json
{
  // Enable auto-fix
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  
  // Disable auto-fix
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "never"
  }
}
```

### Manual Fix in VS Code
1. Hover over error (red squiggly line)
2. Click 💡 lightbulb icon
3. Select "Fix this problem"
4. Or press `Ctrl+.` (Quick Fix)

---

## 📊 Rule Severity

| Icon | Severity | Build | Description |
|------|----------|-------|-------------|
| 🔴 | error | ❌ Fails | Must fix |
| 🟡 | warn | ✅ Passes | Should fix |
| ⚪ | off | ✅ Passes | Not checked |

---

## 🎯 When to Use Each Mode

### Standard Mode (`npm run lint`)
- Daily development
- Feature work
- Debugging (console.log allowed in standard mode with warnings)
- Quick iteration

### Enterprise Mode (`npm run lint:enterprise`)
- Before committing code
- CI/CD pipelines
- Production builds
- Code review
- Quality gates

---

## 💡 Pro Tips

### 1. Check Before Commit
```bash
npm run lint:enterprise && git commit -m "message"
```

### 2. Fix Common Issues Automatically
```bash
npm run lint:fix
```

### 3. See All Errors at Once
```bash
npm run lint:check
```

### 4. Ignore Specific Rule for One Line
```javascript
// eslint-disable-next-line rule-name
const problematic = code;
```

### 5. View Rule Documentation
- Hover over error in VS Code
- Click on error code
- Opens documentation

---

## 🚨 Emergency Fixes

### Too Many Errors?
```bash
# Fix all auto-fixable issues first
npm run lint:fix

# Then manually fix remaining
npm run lint
```

### Need to Deploy Now?
```bash
# Check what's blocking
npm run lint

# Fix critical errors only
# Mark others with TODO comments
```

### Legacy Code Issues?
```bash
# Add to top of file temporarily
/* eslint-disable */

// Plan migration strategy
// Fix gradually
```

---

## 📈 Daily Workflow

```bash
# 1. Start coding
npm run dev

# 2. Code auto-fixes on save (VS Code)

# 3. Before commit
npm run lint:fix

# 4. Final check
npm run lint:enterprise

# 5. Commit if all pass
git commit -m "feat: new feature"
```

---

## 🔍 Debug ESLint Issues

### ESLint Not Working?
```bash
# 1. Restart ESLint
# Press Ctrl+Shift+P → "ESLint: Restart ESLint Server"

# 2. Check output
# View → Output → Select "ESLint"

# 3. Reinstall
npm install
```

### Wrong Rules Applied?
```bash
# Check which config is active
npm run lint -- --print-config path/to/file.jsx
```

---

## 📚 Learn More

- **Full Guide**: [ENTERPRISE_ESLINT_GUIDE.md](./ENTERPRISE_ESLINT_GUIDE.md)
- **Setup Guide**: [ESLINT_SETUP_GUIDE.md](./ESLINT_SETUP_GUIDE.md)
- **ESLint Docs**: https://eslint.org/docs/rules/

---

## ✅ Checklist

- [ ] Restart VS Code
- [ ] Install ESLint extension
- [ ] Run `npm run lint`
- [ ] Fix errors with `npm run lint:fix`
- [ ] Test enterprise mode: `npm run lint:enterprise`
- [ ] Enable auto-fix on save
- [ ] Read the common errors above

---

**Print this and keep it handy! 📋✨**

