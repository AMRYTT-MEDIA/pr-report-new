# 🎯 ESLint Configuration - Quick Start

## ✨ What You Have

**ONE unified `.eslintrc.json` file** with 180+ enterprise-level rules!

---

## 🚀 Commands (Use These!)

```bash
# Check for errors (warnings allowed)
npm run lint

# Auto-fix all fixable issues
npm run lint:fix

# Strict mode - zero warnings allowed (for CI/CD)
npm run lint:strict

# Detailed report with statistics
npm run lint:report

# Export report to JSON
npm run lint:report:json
```

---

## 📁 Project Structure

```
your-project/
├── .eslintrc.json          ← ONE config file with ALL rules
├── .eslintignore           ← Files to ignore
├── .vscode/
│   ├── settings.json       ← Auto-fix on save enabled
│   └── extensions.json     ← ESLint extension recommended
└── package.json            ← Lint commands configured
```

---

## ⚡ Quick Start

### Step 1: Restart VS Code

Close and reopen VS Code to apply settings.

### Step 2: Install ESLint Extension

1. Press `Ctrl+Shift+X`
2. Search "ESLint"
3. Install "ESLint" by Microsoft

### Step 3: Test It

```bash
npm run lint:fix
```

### Step 4: Start Coding!

VS Code will now:

- ✅ Show errors in real-time
- ✅ Auto-fix on save
- ✅ Provide quick fixes (Ctrl+.)

---

## 🎯 What's Configured

### 180+ Rules Across:

- ✅ Variables (no-unused-vars, prefer-const, no-var)
- ✅ Best Practices (eqeqeq, no-eval, require-await)
- ✅ Security (no-alert, no-proto, no-script-url)
- ✅ Code Quality (prefer-template, object-shorthand)
- ✅ React (jsx-key, hooks rules)
- ✅ Next.js (use next/image, use Link)
- ✅ Error Handling (no-throw-literal)

---

## 💡 Top 5 Common Fixes

### 1. no-unused-vars

```javascript
// ❌ const unused = "value";
// ✅ Remove it or use it
```

### 2. no-var

```javascript
// ❌ var name = "John";
// ✅ const name = "John";
```

### 3. prefer-const

```javascript
// ❌ let name = "John";
// ✅ const name = "John"; // if not reassigning
```

### 4. react/jsx-key

```javascript
// ❌ {items.map(i => <div>{i}</div>)}
// ✅ {items.map(i => <div key={i.id}>{i}</div>)}
```

### 5. @next/next/no-img-element

```javascript
// ❌ <img src="/logo.png" />
// ✅ <Image src="/logo.png" width={100} height={100} />
```

---

## 🔧 Daily Workflow

```bash
# 1. Start dev server
npm run dev

# 2. Code (auto-fix on save works!)

# 3. Before commit
npm run lint:fix
npm run lint:strict

# 4. Commit if all pass
git commit -m "feat: new feature"
```

---

## 🐛 Troubleshooting

### ESLint not working?

```bash
# Restart ESLint Server
# Ctrl+Shift+P → "ESLint: Restart ESLint Server"
```

### Too many errors?

```bash
# Auto-fix most issues
npm run lint:fix
```

### Need to ignore a line?

```javascript
// eslint-disable-next-line rule-name
const code = "here";
```

---

## 📚 Full Documentation

- **Quick Reference**: [ESLINT_UNIFIED_GUIDE.md](./ESLINT_UNIFIED_GUIDE.md)
- **All Rules Explained**: [ENTERPRISE_ESLINT_GUIDE.md](./ENTERPRISE_ESLINT_GUIDE.md)
- **Setup & Troubleshooting**: [ESLINT_SETUP_GUIDE.md](./ESLINT_SETUP_GUIDE.md)
- **Quick Ref Card**: [ESLINT_RULES_QUICK_REF.md](./ESLINT_RULES_QUICK_REF.md)

---

## ✅ Summary

✅ **One configuration file** - Simple and clear
✅ **180+ rules** - Enterprise-grade
✅ **Auto-fix enabled** - Save time
✅ **VS Code integrated** - Real-time feedback
✅ **CI/CD ready** - Use `npm run lint:strict`

---

**🎉 You're ready to code with professional ESLint configuration!**

Run `npm run lint:fix` now and start coding! 🚀
