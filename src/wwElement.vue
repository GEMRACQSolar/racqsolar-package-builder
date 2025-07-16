<template>
  <div class="racq-package-builder">
    <!-- Header -->
    <div class="header">
      <h2>RACQ Solar Package Builder</h2>
      <div class="header-actions">
        <button v-if="currentMode !== 'list'" @click="setMode('list')" class="btn btn-secondary">
          Back to List
        </button>
        <button v-if="currentMode === 'list'" @click="createNew()" class="btn btn-primary">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 2v12M2 8h12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          Create New Package
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <div class="content">
      <!-- Package List View -->
      <div v-if="currentMode === 'list'" class="package-list">
        <div v-if="!content.packages || content.packages.length === 0" class="empty-state">
          <p>No packages created yet</p>
          <button @click="createNew()" class="btn btn-primary">Create Your First Package</button>
        </div>
        
        <div v-else class="packages-grid">
          <div v-for="pkg in content.packages" :key="pkg.id" class="package-card">
            <div class="package-header">
              <h3>{{ pkg.name }}</h3>
              <span class="system-type" :class="pkg.system_type">{{ formatSystemType(pkg.system_type) }}</span>
            </div>
            <div class="package-details">
              <p class="tagline">{{ pkg.tagline }}</p>
              <div class="specs">
                <span v-if="pkg.array_size_kw">{{ pkg.array_size_kw }}kW Solar</span>
                <span v-if="pkg.battery_size_kwh">{{ pkg.battery_size_kwh }}kWh Battery</span>
              </div>
              <div class="price" v-if="pkg.final_price">
                ${{ formatPrice(pkg.final_price) }}
                <span v-if="pkg.discount_amount" class="discount">Save {{ formatDiscount(pkg) }}</span>
              </div>
            </div>
            <div class="package-actions">
              <button @click="editPackage(pkg)" class="btn btn-sm btn-secondary">Edit</button>
              <button @click="deletePackage(pkg)" class="btn btn-sm btn-danger">Delete</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Package Editor View -->
      <div v-if="currentMode === 'create' || currentMode === 'edit'" class="package-editor">
        <form @submit.prevent="savePackage">
          <!-- Hardware Selection -->
          <section class="form-section">
            <h3>Hardware Selection</h3>
            
            <div class="form-group">
              <label>Solar Panels *</label>
              <select v-model="formData.panel_id" @change="calculateSystemSize" required>
                <option value="">Select panels...</option>
                <option v-for="panel in content.panels" :key="panel.id" :value="panel.id">
                  {{ panel.manufacturer }} {{ panel.model }} - {{ panel.power_rating }}W
                </option>
              </select>
            </div>

            <div class="form-group">
              <label>Number of Panels *</label>
              <input type="number" v-model.number="formData.panel_quantity" 
                     @input="calculateSystemSize" min="1" required>
            </div>

            <div class="form-group">
              <label>Inverter *</label>
              <select v-model="formData.inverter_id" required>
                <option value="">Select inverter...</option>
                <option v-for="inverter in content.inverters" :key="inverter.id" :value="inverter.id">
                  {{ inverter.manufacturer }} {{ inverter.model }} - {{ inverter.rated_capacity_kw }}kW
                </option>
              </select>
            </div>

            <div class="form-group">
              <label>Battery (Optional)</label>
              <select v-model="formData.battery_id" @change="calculateSystemSize">
                <option value="">No battery</option>
                <option v-for="battery in content.batteries" :key="battery.id" :value="battery.id">
                  {{ battery.manufacturer }} {{ battery.model }} - {{ battery.usable_capacity_kwh }}kWh
                </option>
              </select>
            </div>

            <div class="form-group" v-if="formData.battery_id">
              <label>Number of Batteries</label>
              <input type="number" v-model.number="formData.battery_quantity" 
                     @input="calculateSystemSize" min="1">
            </div>
          </section>

          <!-- Auto-calculated Fields -->
          <section class="form-section calculated-fields">
            <h3>System Specifications</h3>
            <div class="specs-grid">
              <div class="spec-item">
                <label>Array Size</label>
                <div class="value">{{ formData.array_size_kw }} kW</div>
              </div>
              <div class="spec-item" v-if="formData.battery_size_kwh">
                <label>Battery Capacity</label>
                <div class="value">{{ formData.battery_size_kwh }} kWh</div>
              </div>
              <div class="spec-item">
                <label>System Type</label>
                <div class="value">{{ formatSystemType(formData.system_type) }}</div>
              </div>
            </div>
          </section>

          <!-- Package Details -->
          <section class="form-section">
            <h3>Package Details</h3>
            
            <div class="form-group">
              <label>Package Name *</label>
              <input type="text" v-model="formData.name" placeholder="e.g. Premium Solar & Battery Package" required>
            </div>

            <div class="form-group">
              <label>Tagline *</label>
              <input type="text" v-model="formData.tagline" placeholder="e.g. Maximum savings with battery storage" required>
            </div>

            <div class="form-group">
              <label>Description</label>
              <textarea v-model="formData.description" rows="4" 
                        placeholder="Detailed description of the package benefits..."></textarea>
            </div>
          </section>

          <!-- Pricing -->
          <section class="form-section">
            <h3>Pricing</h3>
            
            <div class="form-group">
              <label>Base Price ($) *</label>
              <input type="number" v-model.number="formData.base_price" 
                     @input="calculateFinalPrice" min="0" step="0.01" required>
            </div>

            <div class="form-group">
              <label>Discount Type</label>
              <select v-model="formData.discount_type" @change="calculateFinalPrice">
                <option value="none">No discount</option>
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed amount ($)</option>
              </select>
            </div>

            <div class="form-group" v-if="formData.discount_type !== 'none'">
              <label>Discount Amount</label>
              <input type="number" v-model.number="formData.discount_amount" 
                     @input="calculateFinalPrice" min="0" step="0.01">
            </div>

            <div class="price-summary">
              <div class="price-line" v-if="formData.base_price">
                <span>Base Price:</span>
                <span>${{ formatPrice(formData.base_price) }}</span>
              </div>
              <div class="price-line discount" v-if="formData.discount_amount">
                <span>Discount:</span>
                <span>-{{ formatDiscount(formData) }}</span>
              </div>
              <div class="price-line total">
                <span>Final Price:</span>
                <span>${{ formatPrice(formData.final_price) }}</span>
              </div>
            </div>
          </section>

          <!-- Form Actions -->
          <div class="form-actions">
            <button type="button" @click="setMode('list')" class="btn btn-secondary">Cancel</button>
            <button type="submit" class="btn btn-primary" :disabled="!isFormValid">
              {{ currentMode === 'create' ? 'Create Package' : 'Update Package' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RACQPackageBuilder',
  
  props: {
    content: {
      type: Object,
      required: true
    }
  },
  
  emits: [
    'update:content',
    'trigger-event'
  ],
  
  data() {
    return {
      currentMode: 'list',
      formData: this.getEmptyFormData()
    }
  },
  
  computed: {
    isFormValid() {
      return this.formData.name && 
             this.formData.tagline && 
             this.formData.panel_id && 
             this.formData.panel_quantity > 0 &&
             this.formData.inverter_id &&
             this.formData.base_price > 0
    }
  },
  
  watch: {
    'content.mode': {
      immediate: true,
      handler(newMode) {
        if (newMode && newMode !== this.currentMode) {
          this.currentMode = newMode
        }
      }
    },
    
    'content.selectedPackage': {
      immediate: true,
      handler(pkg) {
        if (pkg && this.currentMode === 'edit') {
          this.loadPackageData(pkg)
        }
      }
    }
  },
  
  methods: {
    getEmptyFormData() {
      return {
        id: null,
        name: '',
        tagline: '',
        description: '',
        system_type: 'pv_only',
        panel_id: '',
        panel_quantity: 10,
        inverter_id: '',
        battery_id: '',
        battery_quantity: 1,
        array_size_kw: 0,
        battery_size_kwh: 0,
        base_price: 0,
        discount_type: 'none',
        discount_amount: 0,
        final_price: 0
      }
    },
    
    setMode(mode) {
      this.currentMode = mode
      this.$emit('trigger-event', {
        name: 'mode:changed',
        event: {
          mode: mode,
          timestamp: new Date().toISOString()
        }
      })
    },
    
    createNew() {
      this.formData = this.getEmptyFormData()
      this.setMode('create')
    },
    
    editPackage(pkg) {
      this.loadPackageData(pkg)
      this.setMode('edit')
      this.$emit('trigger-event', {
        name: 'package:selected',
        event: {
          package: pkg,
          mode: 'edit',
          timestamp: new Date().toISOString()
        }
      })
    },
    
    loadPackageData(pkg) {
      this.formData = { ...pkg }
    },
    
    calculateSystemSize() {
      // Calculate array size
      if (this.formData.panel_id && this.formData.panel_quantity) {
        const panel = this.content.panels?.find(p => p.id === this.formData.panel_id)
        if (panel) {
          this.formData.array_size_kw = (panel.power_rating * this.formData.panel_quantity / 1000).toFixed(2)
        }
      }
      
      // Calculate battery size
      if (this.formData.battery_id && this.formData.battery_quantity) {
        const battery = this.content.batteries?.find(b => b.id === this.formData.battery_id)
        if (battery) {
          this.formData.battery_size_kwh = (battery.usable_capacity_kwh * this.formData.battery_quantity).toFixed(1)
          this.formData.system_type = 'pv_and_battery'
        } else {
          this.formData.battery_size_kwh = 0
          this.formData.system_type = 'pv_only'
        }
      } else {
        this.formData.battery_size_kwh = 0
        this.formData.system_type = 'pv_only'
      }
      
      this.calculateFinalPrice()
    },
    
    calculateFinalPrice() {
      let finalPrice = this.formData.base_price || 0
      
      if (this.formData.discount_type === 'percentage' && this.formData.discount_amount) {
        finalPrice = finalPrice * (1 - this.formData.discount_amount / 100)
      } else if (this.formData.discount_type === 'fixed' && this.formData.discount_amount) {
        finalPrice = finalPrice - this.formData.discount_amount
      }
      
      this.formData.final_price = Math.max(0, finalPrice)
    },
    
    async savePackage() {
      const eventName = this.currentMode === 'create' ? 'package:created' : 'package:updated'
      
      // In a real implementation, you would save to Supabase here
      // For now, we'll just emit the event
      
      this.$emit('trigger-event', {
        name: eventName,
        event: {
          package: { ...this.formData },
          timestamp: new Date().toISOString()
        }
      })
      
      this.setMode('list')
    },
    
    deletePackage(pkg) {
      if (confirm(`Are you sure you want to delete "${pkg.name}"?`)) {
        this.$emit('trigger-event', {
          name: 'package:deleted',
          event: {
            packageId: pkg.id,
            timestamp: new Date().toISOString()
          }
        })
      }
    },
    
    formatSystemType(type) {
      const types = {
        'pv_only': 'PV Only',
        'pv_and_battery': 'PV & Battery'
      }
      return types[type] || type
    },
    
    formatPrice(price) {
      return parseFloat(price || 0).toLocaleString('en-AU', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      })
    },
    
    formatDiscount(pkg) {
      if (!pkg.discount_amount) return ''
      
      if (pkg.discount_type === 'percentage') {
        return `${pkg.discount_amount}%`
      } else {
        return `$${this.formatPrice(pkg.discount_amount)}`
      }
    }
  }
}
</script>

<style scoped>
.racq-package-builder {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #1a1a1a;
}

/* Header */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e5e5;
  background: #f8f9fa;
}

.header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #0066cc;
  color: white;
}

.btn-primary:hover {
  background: #0052a3;
}

.btn-secondary {
  background: #e5e5e5;
  color: #333;
}

.btn-secondary:hover {
  background: #d0d0d0;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-danger:hover {
  background: #c82333;
}

.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.8125rem;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Content Area */
.content {
  padding: 1.5rem;
}

/* Package List */
.empty-state {
  text-align: center;
  padding: 3rem;
  color: #666;
}

.empty-state p {
  margin-bottom: 1.5rem;
  font-size: 1.125rem;
}

.packages-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.package-card {
  background: white;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  padding: 1.5rem;
  transition: box-shadow 0.2s;
}

.package-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.package-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.package-header h3 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
}

.system-type {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-weight: 500;
}

.system-type.pv_only {
  background: #e7f3ff;
  color: #0066cc;
}

.system-type.pv_and_battery {
  background: #e8f5e9;
  color: #2e7d32;
}

.package-details {
  margin-bottom: 1rem;
}

.tagline {
  margin: 0.5rem 0;
  color: #666;
  font-size: 0.875rem;
}

.specs {
  display: flex;
  gap: 1rem;
  margin: 0.75rem 0;
  font-size: 0.875rem;
  color: #555;
}

.price {
  font-size: 1.25rem;
  font-weight: 600;
  color: #0066cc;
  margin-top: 0.75rem;
}

.discount {
  font-size: 0.875rem;
  color: #2e7d32;
  font-weight: 400;
  margin-left: 0.5rem;
}

.package-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e5e5;
}

/* Package Editor */
.package-editor {
  max-width: 800px;
  margin: 0 auto;
}

.form-section {
  background: white;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.form-section h3 {
  margin: 0 0 1.5rem;
  font-size: 1.125rem;
  font-weight: 600;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #333;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d0d0d0;
  border-radius: 4px;
  font-size: 0.875rem;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #0066cc;
}

/* Calculated Fields */
.calculated-fields {
  background: #f8f9fa;
}

.specs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1.5rem;
}

.spec-item label {
  font-size: 0.75rem;
  color: #666;
  margin-bottom: 0.25rem;
}

.spec-item .value {
  font-size: 1.125rem;
  font-weight: 600;
  color: #0066cc;
}

/* Price Summary */
.price-summary {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 4px;
  margin-top: 1rem;
}

.price-line {
  display: flex;
  justify-content: space-between;
  padding: 0.25rem 0;
  font-size: 0.875rem;
}

.price-line.discount {
  color: #2e7d32;
}

.price-line.total {
  font-size: 1.125rem;
  font-weight: 600;
  color: #0066cc;
  border-top: 1px solid #d0d0d0;
  margin-top: 0.5rem;
  padding-top: 0.5rem;
}

/* Form Actions */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding-top: 1.5rem;
}
</style>