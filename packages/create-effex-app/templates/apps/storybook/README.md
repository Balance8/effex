# Aurora Design System - Storybook

This is the Storybook application for the Aurora Design System. It provides interactive documentation and testing for all UI components in the `@workspace/ui` package.

## Features

- 📚 Interactive component documentation
- ♿ Accessibility testing with @storybook/addon-a11y
- 🧪 Component testing with Vitest integration
- 🎨 Live component playground
- 📱 Responsive design testing

## Getting Started

### Development

Run Storybook in development mode:

```bash
bun run dev:storybook
```

This will start Storybook on [http://localhost:6006](http://localhost:6006)

### Build

Build the static Storybook site:

```bash
bun run build:storybook
```

### Testing

Run component tests:

```bash
cd apps/storybook
bun run test
```

## Adding Stories

Stories are located in `src/stories/`. To add a new story:

1. Create a new file: `src/stories/ComponentName.stories.ts` or `.tsx`
2. Import the component from `@workspace/ui/components/component-name`
3. Define your stories using the CSF3 format

Example:

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '@workspace/ui/components/button';

const meta = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Button',
  },
};
```

## Structure

```
apps/storybook/
├── .storybook/          # Storybook configuration
│   ├── main.ts          # Main config
│   ├── preview.ts       # Preview config
│   └── vitest.setup.ts  # Vitest setup
├── src/
│   └── stories/         # Component stories
├── public/              # Static assets
└── package.json
```

## Configuration

- **Framework**: Next.js with Vite
- **Addons**:
  - @chromatic-com/storybook
  - @storybook/addon-docs
  - @storybook/addon-a11y
  - @storybook/addon-vitest
  - @storybook/addon-onboarding

## Learn More

- [Storybook Documentation](https://storybook.js.org/docs)
- [Component Story Format](https://storybook.js.org/docs/api/csf)
- [Accessibility Testing](https://storybook.js.org/docs/writing-tests/accessibility-testing)

