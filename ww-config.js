export default {
  editor: {
    label: {
      en: "RACQ Solar Package Builder"
    },
    icon: "cog",
    customStylePropertiesOrder: [],
    customSettingsPropertiesOrder: [
      "packages",
      "panels", 
      "inverters",
      "batteries",
      "additionalMaterials",
      "mode",
      "selectedPackage"
    ]
  },
  
  properties: {
    packages: {
      label: {
        en: "Existing Packages"
      },
      type: "Object",
      bindable: true,
      defaultValue: []
    },
    
    panels: {
      label: {
        en: "Solar Panels Data"
      },
      type: "Object",
      bindable: true,
      defaultValue: []
    },
    
    inverters: {
      label: {
        en: "Inverters Data"
      },
      type: "Object",
      bindable: true,
      defaultValue: []
    },
    
    batteries: {
      label: {
        en: "Batteries Data"
      },
      type: "Object",
      bindable: true,
      defaultValue: []
    },
    
    additionalMaterials: {
      label: {
        en: "Additional Materials Data"
      },
      type: "Object",
      bindable: true,
      defaultValue: []
    },
    
    mode: {
      label: {
        en: "Initial Mode"
      },
      type: "TextRadioGroup",
      options: {
        options: [
          { value: "list", label: { en: "List" } },
          { value: "create", label: { en: "Create" } },
          { value: "edit", label: { en: "Edit" } }
        ]
      },
      bindable: true,
      defaultValue: "list"
    },
    
    selectedPackage: {
      label: {
        en: "Selected Package"
      },
      type: "Object",
      bindable: true,
      defaultValue: null
    }
  },
  
  triggerEvents: [
    {
      name: "package:created",
      label: { en: "On Package Created" },
      event: {
        package: {},
        timestamp: ""
      }
    },
    {
      name: "package:updated",
      label: { en: "On Package Updated" },
      event: {
        package: {},
        timestamp: ""
      }
    },
    {
      name: "package:deleted",
      label: { en: "On Package Deleted" },
      event: {
        packageId: "",
        timestamp: ""
      }
    },
    {
      name: "package:selected",
      label: { en: "On Package Selected" },
      event: {
        package: {},
        mode: "",
        timestamp: ""
      }
    },
    {
      name: "mode:changed",
      label: { en: "On Mode Changed" },
      event: {
        mode: "",
        timestamp: ""
      }
    }
  ]
}