# RACQ Solar Package Builder

A WeWeb component for creating and managing solar system packages.

## Features

- Create new solar packages
- Edit existing packages
- Auto-calculate system sizes
- Manage pricing and discounts
- Hardware selection with dropdowns

## Installation

1. Connect this repository to your WeWeb workspace
2. Import the component
3. Bind your Supabase data to the component properties

## Properties

- **packages**: Array of existing packages
- **panels**: Solar panel options from your database
- **inverters**: Inverter options from your database
- **batteries**: Battery options from your database
- **additionalMaterials**: Other materials from your database
- **mode**: Initial view mode (list/create/edit)
- **selectedPackage**: Currently selected package for editing

## Events

- **package:created**: Fired when a new package is created
- **package:updated**: Fired when a package is updated
- **package:deleted**: Fired when a package is deleted
- **package:selected**: Fired when a package is selected
- **mode:changed**: Fired when the view mode changes