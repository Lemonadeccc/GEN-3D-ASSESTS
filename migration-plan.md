# Web to T-Style Migration Plan

## Overview
This document outlines the migration plan to replace the web folder's navigation and overall styling with those from the t folder, while maintaining the web folder's content and functionality.

## Current State Analysis

### T Folder Analysis
- **Layout**: Simple, clean layout with minimal components
- **Styling**: Uses Tailwind CSS with custom animations
- **Components**: 
  - `layout.tsx`: Basic layout with Geist fonts
  - `page.tsx`: Full-screen layout with navigation and content areas
  - `Flower.tsx`: 3D flower component (TO BE EXCLUDED)
  - Custom animations: `anim-b`, `anim-r`, `anim-show`
- **Design Pattern**: Full-screen layout with fixed positioning, stone background

### Web Folder Analysis
- **Layout**: Complex layout with header, navigation, and main content
- **Components**:
  - `Navbar.tsx`: Full-featured navigation with wallet integration
  - `Header.tsx`: Header component with logo and actions
  - `NavigationMenu.tsx`: Menu component with icons and badges
  - Rich UI component system (shadcn/ui)
- **Features**: Web3 integration, responsive design, complex routing

## Migration Requirements

### Homepage Content Changes
- **Title**: Change to "3D NFT GENERATOR" (English)
- **Process Flow**: AI生成 -> 预览编辑 -> 纹理优化 -> NFT铸造
- **CTA Button**: "开始生成" (Start Generating)
- **Top Right**: "GENERATE NFT MARKET" + wallet identifier
- **Preserve**: Bottom left content from homepage

### Exclusions
- **Remove**: Flower component and all flower-related functionality
- **Remove**: T folder specific branding ("Fe", "FedDragon", etc.)

## Migration Strategy

### Phase 1: Create New Layout Components
1. **tLayout.tsx**: New layout based on t folder styling
2. **tNavigation.tsx**: New navigation component with t folder design
3. **tHomepage.tsx**: New homepage with required content changes
4. **Import t folder CSS**: Copy animation styles to web folder

### Phase 2: Implement Toggle Functionality
1. **Toggle Component**: Add top-right toggle button
2. **Layout Switcher**: Create layout switching mechanism
3. **Route Handling**: Maintain same routes for both layouts

### Phase 3: Content Integration
1. **Preserve Web Content**: Keep all existing page content
2. **Apply T Styling**: Use t folder's visual design patterns
3. **Maintain Functionality**: Keep all web3 and NFT functionality

## Detailed Implementation Plan

### 1. File Structure Changes

```
web/src/components/
├── layout/
│   ├── Header.tsx (existing)
│   ├── tHeader.tsx (new)
│   ├── MainLayout.tsx (existing)
│   ├── tMainLayout.tsx (new)
│   ├── NavigationMenu.tsx (existing)
│   └── tNavigationMenu.tsx (new)
```

### 2. New Components to Create

#### 2.1 tMainLayout.tsx
- Based on t folder's full-screen layout pattern
- Stone background (`bg-stone-300`)
- Fixed positioning structure
- Custom animations integration

#### 2.2 tNavigation.tsx
- Top navigation with "GENERATE NFT MARKET" and wallet
- Simple, minimal design based on t folder
- Integration with existing web3 functionality

#### 2.3 tHomepage.tsx
- Central "3D NFT GENERATOR" title
- Process flow: AI生成 -> 预览编辑 -> 纹理优化 -> NFT铸造
- "开始生成" button
- Bottom left preservation

### 3. CSS Integration

#### 3.1 Animation Styles
Copy from t/app/globals.css:
- `@keyframes show-up-from-bottom`
- `@keyframes show-up-from-right`
- `@keyframes show-up`
- Animation classes: `.anim-b`, `.anim-r`, `.anim-show`

#### 3.2 Layout Styles
- Full-screen layout patterns
- Fixed positioning
- Z-index management

### 4. Toggle Implementation

#### 4.1 Toggle Button
- Position: Top-right corner
- Labels: "Original" / "New Design"
- Persistent across navigation

#### 4.2 Layout Switching Logic
```typescript
const [useNewLayout, setUseNewLayout] = useState(false);
const LayoutComponent = useNewLayout ? tMainLayout : MainLayout;
```

### 5. Font Integration
- Use t folder's Geist fonts
- Integrate with existing web folder structure
- Maintain font loading optimization

## File Naming Convention
- Prefix new components with `t` (e.g., `tLayout.tsx`, `tNavigation.tsx`)
- Keep original files unchanged
- Create parallel component structure

## Testing Strategy
1. **Layout Toggle**: Test switching between layouts
2. **Functionality Preservation**: Ensure all web3 features work
3. **Responsive Design**: Test on different screen sizes
4. **Animation Performance**: Verify smooth animations

## Dependencies
- No new dependencies required
- Utilize existing:
  - Tailwind CSS
  - Next.js fonts (Geist)
  - Existing UI component library
  - Web3 integration libraries

## Timeline Estimation
- Phase 1 (Layout Components): 2-3 hours
- Phase 2 (Toggle Functionality): 1-2 hours
- Phase 3 (Content Integration): 1-2 hours
- Testing and Refinement: 1 hour

## Risk Mitigation
1. **Backup Strategy**: Keep original files intact
2. **Gradual Migration**: Implement toggle for safe switching
3. **Functionality Testing**: Comprehensive testing of web3 features
4. **Performance Monitoring**: Ensure animations don't impact performance

## Success Criteria
- [ ] New layout successfully implements t folder design
- [ ] All existing functionality preserved
- [ ] Toggle between layouts works seamlessly
- [ ] Homepage displays correct content and CTAs
- [ ] Wallet integration remains functional
- [ ] Navigation maintains all routes
- [ ] Animations work smoothly
- [ ] Responsive design maintained

## Post-Migration Cleanup
After successful migration and user approval:
1. Remove toggle functionality if desired
2. Delete original layout components
3. Rename new components to standard names
4. Update documentation