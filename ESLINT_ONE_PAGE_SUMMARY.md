# 🎯 ESLint - One Page Summary

```
╔══════════════════════════════════════════════════════════════════════════╗
║                  ENTERPRISE ESLINT - QUICK REFERENCE                      ║
║                    ONE CONFIG FILE • 180+ RULES                          ║
╚══════════════════════════════════════════════════════════════════════════╝
```

## 📁 Configuration

```
✓ .eslintrc.json          ← ONE config file (all rules here)
✓ .eslintignore           ← Files to ignore
✓ .vscode/settings.json   ← Auto-fix on save enabled
```

---

## 🚀 Commands

```bash
npm run lint              # Check errors (dev mode)
npm run lint:fix          # Auto-fix all issues
npm run lint:strict       # Zero warnings (for CI/CD)
npm run lint:report       # Detailed report
```

---

## 🎯 Top 10 Rules (90% of errors)

```javascript
// 1. no-unused-vars
const unused = "x";  ❌  →  Remove it  ✅

// 2. no-var
var name = "John";  ❌  →  const name = "John";  ✅

// 3. prefer-const
let name = "John";  ❌  →  const name = "John";  ✅

// 4. eqeqeq
if (x == null) {}  ❌  →  if (x === null) {}  ✅

// 5. react/jsx-key
{items.map(i => <div>{i}</div>)}  ❌
{items.map(i => <div key={i.id}>{i}</div>)}  ✅

// 6. react-hooks/exhaustive-deps
useEffect(() => { use(val); }, []);  ❌
useEffect(() => { use(val); }, [val]);  ✅

// 7. @next/next/no-img-element
<img src="/logo.png" />  ❌
<Image src="/logo.png" width={100} height={100} />  ✅

// 8. prefer-template
const msg = "Hi " + name;  ❌
const msg = `Hi ${name}`;  ✅

// 9. object-shorthand
const obj = { x: x };  ❌
const obj = { x };  ✅

// 10. no-throw-literal
throw "Error!";  ❌
throw new Error("Error!");  ✅
```

---

## 💡 Quick Fixes

```javascript
// Ignore one line
// eslint-disable-next-line rule-name
const code = "here";

// Ignore entire file
/* eslint-disable */

// Quick fix in VS Code
Ctrl + .  (on the error)
```

---

## 🔄 Daily Workflow

```bash
1. npm run dev               # Start coding
2. [Auto-fix on save works]  # VS Code handles it
3. npm run lint:fix          # Before commit
4. npm run lint:strict       # Final check
5. git commit                # Commit if passes
```

---

## 📊 Rules Count

```
✓ 30+  Variable rules
✓ 40+  Best practices
✓ 25+  Security rules
✓ 35+  Code quality
✓ 20+  React rules
✓ 10+  Next.js rules
✓ 15+  Error handling
✓ 10+  Performance
─────────────────────
  180+ Total Rules
```

---

## 🐛 Troubleshooting

```
Problem: ESLint not working
Fix: Ctrl+Shift+P → "ESLint: Restart ESLint Server"

Problem: Too many errors
Fix: npm run lint:fix

Problem: Need to deploy now
Fix: /* eslint-disable */ (top of file, temporary)
```

---

## ✅ VS Code Features

```
🔴 Red squiggly     = Error (must fix)
🟡 Yellow squiggly  = Warning (should fix)
💡 Lightbulb        = Quick fix available
Ctrl+Shift+M        = Problems panel
Ctrl+.              = Quick fix menu
Save file           = Auto-fix runs
```

---

## 📚 Documentation

```
README_ESLINT.md               ← START HERE
ESLINT_UNIFIED_GUIDE.md        ← Complete guide
ENTERPRISE_ESLINT_GUIDE.md     ← All rules explained
ESLINT_RULES_QUICK_REF.md      ← Quick reference
FINAL_ESLINT_SUMMARY.md        ← Full summary
```

---

## 🎯 CI/CD Integration

```yaml
# GitHub Actions
- run: npm run lint:strict

# Pre-commit Hook
"pre-commit": "npm run lint:fix && npm run lint:strict"
```

---

## ✨ Benefits

```
✓ One config file (no confusion)
✓ 180+ enterprise rules
✓ Auto-fix on save
✓ Real-time feedback
✓ CI/CD ready
✓ Security enforced
✓ Best practices
```

---

```
╔══════════════════════════════════════════════════════════════════════════╗
║                       FIRST COMMAND TO RUN                                ║
║                      npm run lint:fix                                     ║
║                                                                           ║
║                   Then start coding! 🚀                                   ║
╚══════════════════════════════════════════════════════════════════════════╝
```

---

**Print this page and keep it handy! 📋**
