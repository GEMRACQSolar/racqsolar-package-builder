# Integration Guide

## Quick Setup in WeWeb

1. **Import the Component**
   - In your WeWeb project, go to the "Coded components" tab
   - Click "Import element" 
   - The component should appear automatically since your GitHub is connected

2. **Bind Your Supabase Data**
   
   You'll need to bind these properties to your Supabase collections:
   
   - **packages**: Your existing packages collection
   - **panels**: Your solar panels collection
   - **inverters**: Your inverters collection  
   - **batteries**: Your batteries collection
   - **additionalMaterials**: Your other materials collection

3. **Handle Events**

   The component emits these events that you can use to update your Supabase:
   
   - `package:created` - Save new package to Supabase
   - `package:updated` - Update existing package
   - `package:deleted` - Delete package from Supabase

## Example Supabase Integration

```javascript
// On package:created event
const newPackage = event.package;
await supabase
  .from('packages')
  .insert(newPackage);

// On package:updated event  
const { id, ...updates } = event.package;
await supabase
  .from('packages')
  .update(updates)
  .eq('id', id);

// On package:deleted event
await supabase
  .from('packages')
  .delete()
  .eq('id', event.packageId);
```

## Component Structure

The component has three modes:
- **list**: Shows all packages
- **create**: Create new package form
- **edit**: Edit existing package form

The component automatically calculates:
- Array size based on panel selection and quantity
- Battery capacity based on battery selection and quantity
- System type (PV Only or PV & Battery)
- Final price based on discounts

## Customization

You can modify the styles in the `<style>` section of `src/wwElement.vue` to match your brand colors.