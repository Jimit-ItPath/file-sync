import { chromium, Browser, Page } from '@playwright/test';
import fs from 'fs';
import path from 'path';

interface TestAction {
  type: 'click' | 'fill' | 'navigate' | 'expect';
  selector?: string;
  value?: string;
  url?: string;
  description: string;
}

export class AutoTestGenerator {
  private browser: Browser;
  private page: Page;
  private actions: TestAction[] = [];
  private currentModule: string;

  constructor(moduleName: string) {
    this.currentModule = moduleName;
  }

  async initialize() {
    this.browser = await chromium.launch({ headless: false });
    this.page = await this.browser.newPage();

    // Record user interactions
    await this.page.exposeFunction('recordAction', (action: TestAction) => {
      this.actions.push(action);
    });

    // Inject recording script
    await this.page.addInitScript(() => {
      // Record clicks
      document.addEventListener('click', e => {
        const target = e.target as HTMLElement;
        const selector = this.generateSelector(target);
        window.recordAction({
          type: 'click',
          selector,
          description: `Click on ${target.textContent || target.tagName}`,
        });
      });

      // Record form fills
      document.addEventListener('input', e => {
        const target = e.target as HTMLInputElement;
        if (target.type !== 'password') {
          const selector = this.generateSelector(target);
          window.recordAction({
            type: 'fill',
            selector,
            value: target.value,
            description: `Fill ${target.placeholder || target.name || 'input'}`,
          });
        }
      });
    });
  }

  async startRecording(startUrl: string) {
    await this.page.goto(startUrl);
    console.log(`🎬 Recording started for ${this.currentModule} module`);
    console.log('Perform your test actions in the browser...');
    console.log('Press Ctrl+C when done recording');
  }

  async generateTestFile() {
    const testContent = this.generateTestCode();
    const fileName = `tests/modules/${this.currentModule}.spec.ts`;

    await fs.promises.mkdir(path.dirname(fileName), { recursive: true });
    await fs.promises.writeFile(fileName, testContent);

    console.log(`✅ Test file generated: ${fileName}`);
  }

  private generateTestCode(): string {
    const imports = `import { test, expect } from '@playwright/test';
import { TestHelpers, TEST_USERS } from '../utils/test-helpers';

`;

    const testCases = this.groupActionsByScenario()
      .map(scenario => this.generateTestCase(scenario))
      .join('\n\n');

    return imports + testCases;
  }

  private groupActionsByScenario(): TestAction[][] {
    // Group actions into logical test scenarios
    const scenarios: TestAction[][] = [];
    let currentScenario: TestAction[] = [];

    for (const action of this.actions) {
      if (action.type === 'navigate' && currentScenario.length > 0) {
        scenarios.push([...currentScenario]);
        currentScenario = [action];
      } else {
        currentScenario.push(action);
      }
    }

    if (currentScenario.length > 0) {
      scenarios.push(currentScenario);
    }

    return scenarios;
  }

  private generateTestCase(actions: TestAction[]): string {
    const testName = this.generateTestName(actions);
    const testSteps = actions
      .map(action => this.generateTestStep(action))
      .join('\n  ');

    return `test('${testName}', async ({ page }) => {
  const helpers = new TestHelpers(page);
  
  ${testSteps}
});`;
  }

  private generateTestName(actions: TestAction[]): string {
    const firstAction = actions[0];
    const lastAction = actions[actions.length - 1];

    if (firstAction?.url) {
      return `${this.currentModule} - ${firstAction.url} flow`;
    }

    return `${this.currentModule} - ${firstAction?.description || 'user interaction'}`;
  }

  private generateTestStep(action: TestAction): string {
    switch (action.type) {
      case 'navigate':
        return `await page.goto('${action.url}');`;
      case 'click':
        return `await page.locator('${action.selector}').click();`;
      case 'fill':
        return `await page.locator('${action.selector}').fill('${action.value}');`;
      case 'expect':
        return `await expect(page.locator('${action.selector}')).toBeVisible();`;
      default:
        return `// ${action.description}`;
    }
  }

  async cleanup() {
    await this.browser.close();
  }
}

// CLI usage
if (require.main === module) {
  const moduleName = process.argv[2];
  const startUrl = process.argv[3] || 'http://localhost:5000';

  if (!moduleName) {
    console.error('Usage: node test-generator.js <module-name> [start-url]');
    process.exit(1);
  }

  const generator = new AutoTestGenerator(moduleName);

  generator
    .initialize()
    .then(() => {
      return generator.startRecording(startUrl);
    })
    .then(() => {
      return generator.generateTestFile();
    })
    .finally(() => {
      return generator.cleanup();
    });
}
