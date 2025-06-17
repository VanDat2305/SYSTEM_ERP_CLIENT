<template>
  <BaseModal :show="isModalOpen" :close="handleClose" :size="'full'" :closeOnClickOutside="false">
    <!-- Header -->
    <template #header>
      <div>
        <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
          {{
            isViewMode ? t('orders.view_title') :
              isEditMode ? t('orders.edit_title') :
                t('orders.add_title')
          }}
        </h3>
        <!-- <div v-if="isViewMode && formData.order_code" class="mt-2 flex items-center gap-2">
          <span class="font-semibold text-xs text-gray-500 uppercase tracking-widest">
            {{ t('orders.fields.order_code') }}:
          </span>
          <span
            class="text-xs bg-gray-100 dark:bg-gray-700 text-blue-700 dark:text-blue-300 px-3 py-1 rounded select-none border border-gray-200 dark:border-gray-600">
            {{ formData.order_code || '-' }}
          </span>
        </div> -->
      </div>
    </template>

    <!-- Body -->
    <template #body>
      <form @submit.prevent="handleSubmit" class="px-4 py-4 md:py-6 space-y-6 mx-auto">
        <!-- Order information -->
        <fieldset class="p-5 rounded-2xl shadow border border-blue-100 dark:border-gray-700 mb-2">
          <legend
            class="flex items-center gap-1 text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-widest px-1">
            {{ t('orders.group_order') }}
          </legend>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label class="text-xs font-bold text-gray-700 dark:text-gray-200">{{ t('orders.fields.order_code')
              }}</label>
              <input type="text" v-model="formData.order_code" :disabled="true"
                :placeholder="t('orders.auto_generated')" class="input-form mt-2" />
              <p v-if="errors.order_code" class="text-xs text-red-500 mt-1">{{ errors.order_code[0] }}</p>
            </div>
            <div>
              <div>
                <label class="text-xs font-bold text-gray-700 dark:text-gray-200">{{ t('orders.fields.created_at')
                }}</label>
                <input type="text" :value="formatDatetime(formData.created_at)" :disabled="true"
                  :placeholder="t('orders.auto_generated')" class="input-form mt-2" />
              </div>
            </div>
            <div>
              <label class="text-xs font-bold text-gray-700 dark:text-gray-200">{{ t('orders.fields.order_status') }}
                <span class="text-red-500">*</span></label>
              <SelectSearch v-model="formData.order_status" :options="statusOptions" :disabled="true" class="mt-2" />
              <p v-if="errors.order_status" class="text-xs text-red-500 mt-1">{{ errors.order_status[0] }}</p>
            </div>

          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            <!-- <div>
              <label class="text-xs font-bold text-gray-700 dark:text-gray-200">{{ t('orders.fields.opportunity') }}</label>
              <SelectSearch v-model="formData.opportunity_id" :options="opportunityOptions" :searchable="true"
                :disabled="isViewMode" :placeholder="t('orders.select_opportunity')" @search="searchOpportunity"
                class="mt-2" />
              <p v-if="errors.opportunity_id" class="text-xs text-red-500 mt-1">{{ errors.opportunity_id[0] }}</p>
            </div>
            <div>
              <label class="text-xs font-bold text-gray-700 dark:text-gray-200">{{ t('orders.fields.team') }}</label>
              <SelectSearch v-model="formData.team_id" :options="teamOptions" :disabled="isViewMode" class="mt-2" />
              <p v-if="errors.team_id" class="text-xs text-red-500 mt-1">{{ errors.team_id[0] }}</p>
            </div>
            <div>
              <label class="text-xs font-bold text-gray-700 dark:text-gray-200">{{ t('orders.fields.billing_cycle') }}</label>
              <SelectSearch v-model="formData.billing_cycle" :options="billingCycleOptions" :disabled="isViewMode"
                class="mt-2" />
              <p v-if="errors.billing_cycle" class="text-xs text-red-500 mt-1">{{ errors.billing_cycle[0] }}</p>
            </div> -->
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-0">
            <div>
              <!-- <label class="text-xs font-bold text-gray-700 dark:text-gray-200">{{ t('orders.fields.contract') }}</label>
              <SelectSearch v-model="formData.contract_id" :options="contractOptions" :searchable="true"
                :disabled="isViewMode" :placeholder="t('orders.select_contract')" @search="searchContract"
                class="mt-2" />
              <p v-if="errors.contract_id" class="text-xs text-red-500 mt-1">{{ errors.contract_id[0] }}</p> -->
              <div>
                <label class="text-xs font-bold text-gray-700 dark:text-gray-200">{{ t('orders.fields.currency') }}
                  <span class="text-red-500">*</span></label>
                <SelectSearch v-model="formData.currency" :options="currencyOptions" :disabled="isViewMode"
                  class="mt-2" />
                <p v-if="errors.currency" class="text-xs text-red-500 mt-1">{{ errors.currency[0] }}</p>
              </div>
            </div>
            <div>
              <label class="text-xs font-bold text-gray-700 dark:text-gray-200">{{ t('orders.fields.total_amount')
              }}</label>
              <div class="relative mt-2">
                <input type="number" step="0.01" v-model="formData.total_amount" :disabled="true"
                  class="input-form pr-12 bg-gray-50 dark:bg-gray-700" :placeholder="t('orders.auto_calculated')" />
                <span class="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">
                  {{ formData.currency || 'VND' }}
                </span>
              </div>
              <p class="text-xs text-gray-500 mt-1">{{ t('orders.auto_calculated_note') }}</p>
            </div>
          </div>


        </fieldset>
        <!-- Customer selection -->
        <fieldset
          class="bg-white/70 dark:bg-gray-800/50 p-6 rounded-2xl shadow-lg border border-emerald-100 dark:border-gray-700 transition-all duration-300 hover:shadow-xl mb-4">
          <legend
            class="flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-widest px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 rounded-full border border-emerald-200 dark:border-emerald-700">
            {{ t('orders.group_customer') }}
          </legend>
          <div class="mb-4">
            <label class="flex items-center text-xs font-semibold text-gray-700 dark:text-gray-200 mb-2">
              {{ t('customers.fields.customer_code') }}
              <span v-if="!isViewMode" class="text-red-500 ml-1">*</span>
            </label>
            <div class="relative">
              <div class="flex gap-2">
                <input type="text" v-model="customerSearchCode" @change="searchCustomerByCode"
                  :readonly="isViewMode || formData.order_code != ''"
                  :placeholder="t('customers.placeholders.customer_code')" :class="[
                    'w-full text-xs px-3 py-2 rounded-lg border transition-colors',
                    formData.order_code != '' ?
                      'bg-gray-100 dark:bg-gray-700 cursor-not-allowed text-gray-600 dark:text-gray-300'
                      : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:border-blue-300',

                    isViewMode
                      ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed text-gray-600 dark:text-gray-300'
                      : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:border-blue-300',
                    errors.customer_code
                      ? 'ring-2 ring-red-300'
                      : 'border-gray-300 dark:border-gray-600'
                  ]" />
                <!-- <button v-if="!isViewMode" type="button" @click="openAddCustomer"
                  class="whitespace-nowrap flex items-center gap-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold rounded-lg shadow transition">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                  </svg>
                  {{ t('orders.add_customer') }}
                </button> -->
              </div>
              <p v-if="errors.customer_code" class="text-xs text-red-500 dark:text-red-400 mt-1">
                {{ errors.customer_code[0] }}
              </p>
            </div>

            <!-- Hidden customer_id field -->
            <input type="hidden" v-model="formData.customer_id" />
          </div>

          <!-- Customer Info Display -->
          <div v-if="selectedCustomer" class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <!-- Basic Info -->
            <div class="space-y-2 col-span-1 md:col-span-2">
              <label
                class="flex items-center text-xs font-semibold text-gray-700 dark:text-gray-200 mb-2 border-b pb-2">
                {{ t('customers.basic_info') }}
              </label>
              <div class="grid grid-cols-2  md:grid-cols-7 gap-2 text-xs pt-2">
                <div class="text-gray-500 dark:text-gray-400">{{ t('customers.fields.full_name') }}:</div>
                <div class="font-medium col-span-1 md:col-span-6 text-gray-700 dark:text-gray-300">{{
                  selectedCustomer.full_name }}</div>

                <!-- <div class="text-gray-500 dark:text-gray-400">{{ t('customers.fields.customer_type') }}:</div>
                <div class="font-medium">{{ selectedCustomer.customer_type }}</div> -->

                <div class="text-gray-500 dark:text-gray-400">{{ t('customers.fields.tax_code') }}:</div>
                <div class="font-medium col-span-1 md:col-span-6 text-gray-700 dark:text-gray-300">{{
                  selectedCustomer.tax_code || '-' }}</div>

                <div class="text-gray-500 dark:text-gray-400">{{ t('customers.fields.address') }}:</div>
                <div class="font-medium col-span-1 md:col-span-6 text-gray-700 dark:text-gray-300">{{
                  selectedCustomer.address }}</div>
              </div>
            </div>

            <!-- Contact Info -->
            <div class="space-y-2">

              <label
                class="flex items-center text-xs font-semibold text-gray-700 dark:text-gray-200 mb-2 border-b pb-2">
                {{ t('customers.contact_info') }}
              </label>
              <div class="pt-2 space-y-1 text-xs" v-for="contact in selectedCustomer.contacts" :key="contact.id">
                <div class="flex items-center gap-2">
                  <span class="text-gray-500 dark:text-gray-400">{{ contact.contact_type }}:</span>
                  <span class="font-medium">{{ contact.value }}</span>
                  <span v-if="contact.is_primary"
                    class="text-xs px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                    {{ t('customers.fields.is_primary') }}
                  </span>
                </div>
                <!-- <div v-if="contact.label" class="text-gray-400 dark:text-gray-500 pl-6">
                  {{ contact.label }}
                </div> -->
              </div>
            </div>
          </div>

          <!-- Error message if no customer selected -->
          <div v-if="errors.customer_id" class="text-xs text-red-500 dark:text-red-400">
            {{ t('orders.errors.customer_required') }}
          </div>

        </fieldset>

        <!-- Order Details Table -->
        <fieldset class="p-5 rounded-2xl shadow border border-indigo-100 dark:border-gray-700 mb-2">
          <legend
            class="flex items-center gap-1 text-xs font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-widest px-1">
            {{ t('orders.group_details') }}
          </legend>

          <!-- show error details -->
          <div v-if="hasErrors && errors.order_details" class="text-xs text-red-500 dark:text-red-400 mb-4">
            {{ errors.order_details[0] }}
          </div>

          <!-- Add Service Package Button -->
          <div v-if="!isViewMode" class="mb-4">
            <button type="button" @click="addOrderDetail"
              class="inline-flex items-center px-3 py-1 text-xs font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 transition">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              {{ t('orders.add_service_package') }}
            </button>
          </div>

          <!-- Order Details List -->
          <div class="space-y-4">
            <div v-for="(detail, index) in formData.order_details" :key="detail.temp_id || detail.id || index"
              class="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
              <div class="flex justify-between items-start mb-3">
                <h4 class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ t('orders.fields.service_package') }} #{{ index + 1 }}
                </h4>
                <button v-if="!isViewMode" type="button" @click="removeOrderDetail(index)"
                  class="text-red-600 hover:text-red-800 text-xs">
                  {{ t('common.remove') }}
                </button>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <!--  -->
                <!-- Service Package Selection -->
                <div>
                  <label class="text-xs font-bold text-gray-700 dark:text-gray-200">
                    {{ t('orders.fields.service_type') }} <span class="text-red-500">*</span>
                  </label>
                  <SelectSearch v-model="detail.service_type" :options="serviceTypeOptions" :searchable="true"
                    :disabled="isViewMode" :placeholder="t('orders.select_service_type')"
                    @update:modelValue="onServiceTypeChange(index, $event)" class="mt-2" />
                  <p v-if="errors[`order_details.${index}.service_type`]" class="text-xs text-red-500 mt-1">
                    {{ errors[`order_details.${index}.service_type`][0] }}
                  </p>
                </div>
                <div class="lg:col-span-2">
                  <label class="text-xs font-bold text-gray-700 dark:text-gray-200">
                    {{ t('orders.fields.service_package') }} <span class="text-red-500">*</span>
                  </label>
                  <SelectSearch v-model="detail.service_package_id" :options="detail.servicePackageOptions || []"
                    :searchable="true" :disabled="isViewMode" :placeholder="t('orders.select_service_package')"
                    @search="searchServicePackage" @update:modelValue="onServicePackageChange(index, $event)"
                    class="mt-2" />
                  <p v-if="errors[`order_details.${index}.service_package_id`]" class="text-xs text-red-500 mt-1">
                    {{ errors[`order_details.${index}.service_package_id`][0] }}
                  </p>
                </div>

                <!-- Package Code (readonly, populated from selection) -->
                <div>
                  <label class="text-xs font-bold text-gray-700 dark:text-gray-200">{{ t('orders.fields.package_code')
                  }}</label>
                  <input type="text" v-model="detail.package_code" :disabled="true"
                    class="input-form mt-2 bg-gray-100 dark:bg-gray-700" />
                </div>

                <!-- Package Name (readonly, populated from selection) -->
                <div>
                  <label class="text-xs font-bold text-gray-700 dark:text-gray-200">{{ t('orders.fields.package_name')
                  }}</label>
                  <input type="text" v-model="detail.package_name" :disabled="true"
                    class="input-form mt-2 bg-gray-100 dark:bg-gray-700" />
                </div>
                                <!-- Tax Included -->
                <div class="flex items-center mt-6">
                  <input type="checkbox" v-model="detail.tax_included" :disabled="isViewMode"
                    @change="calculateDetailTotals(index)" class="mr-2" />
                  <label class="text-xs font-bold text-gray-700 dark:text-gray-200">{{ t('orders.fields.tax_included')
                  }}</label>
                </div>
                <div class="col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4">
                  <!-- Base Price (readonly, populated from selection) -->
                  <div class="lg:col-span-2">
                    <label class="text-xs font-bold text-gray-700 dark:text-gray-200">{{ t('orders.fields.base_price')
                    }}</label>
                    <div class="relative mt-2">
                      <input type="number" step="0.01" v-model="detail.base_price" :disabled="true"
                        @input="calculateDetailTotals(index)" class="input-form pr-12 bg-gray-100 dark:bg-gray-700" />
                      <span class="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">
                        {{ detail.currency || formData.currency || 'VND' }}
                      </span>
                    </div>
                  </div>
                  <!-- Quantity -->
                  <div>
                    <label class="text-xs font-bold text-gray-700 dark:text-gray-200">
                      {{ t('orders.fields.quantity') }} <span class="text-red-500">*</span>
                    </label>
                    <input type="number" v-model.number="detail.quantity" :disabled="isViewMode"
                      @input="calculateDetailTotals(index)" class="input-form mt-2" />
                    <p v-if="errors[`order_details.${index}.quantity`]" class="text-xs text-red-500 mt-1">
                      {{ errors[`order_details.${index}.quantity`][0] }}
                    </p>
                  </div>
                                  <!-- Total Price (calculated) -->
                <div class="lg:col-span-2">
                  <label class="text-xs font-bold text-gray-700 dark:text-gray-200">{{ t('orders.fields.total_price')
                  }}</label>
                  <div class="relative mt-2">
                    <input type="number" step="0.01" v-model="detail.total_price" :disabled="true"
                      class="input-form pr-12 bg-gray-100 dark:bg-gray-700" />
                    <span class="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">
                      {{ detail.currency || formData.currency || 'VND' }}
                    </span>
                  </div>
                </div>
                 <!-- Tax Rate -->
                <div>
                  <label class="text-xs font-bold text-gray-700 dark:text-gray-200">{{ t('orders.fields.tax_rate')
                  }}</label>
                  <div class="relative mt-2">
                    <input type="number" step="0.01" min="0" max="100" v-model.number="detail.tax_rate"
                      :disabled="isViewMode" @input="calculateDetailTotals(index)" class="input-form pr-8" />
                    <span class="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">%</span>
                  </div>
                </div>
                 <!-- Tax Amount (calculated) -->
                <div class="lg:col-span-3">
                  <label class="text-xs font-bold text-gray-700 dark:text-gray-200">{{ t('orders.fields.tax_amount')
                  }}</label>
                  <div class="relative mt-2">
                    <input type="number" step="0.01" v-model="detail.tax_amount" :disabled="true"
                      class="input-form pr-12 bg-gray-100 dark:bg-gray-700" />
                    <span class="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">
                      {{ detail.currency || formData.currency || 'VND' }}
                    </span>
                  </div>
                </div>

                <!-- Total with Tax (calculated) -->
                <div class="lg:col-span-3">
                  <label class="text-xs font-bold text-gray-700 dark:text-gray-200">{{ t('orders.fields.total_with_tax')
                  }}</label>
                  <div class="relative mt-2">
                    <input type="number" step="0.01" v-model="detail.total_with_tax" :disabled="true"
                      class="input-form pr-12 bg-gray-100 dark:bg-gray-700 font-medium" />
                    <span class="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">
                      {{ detail.currency || formData.currency || 'VND' }}
                    </span>
                  </div>
                </div>
                </div>






                <!-- Start Date -->
                <!-- <div>
                  <label class="text-xs font-bold text-gray-700 dark:text-gray-200">
                    {{ t('orders.fields.start_date') }} <span class="text-red-500">*</span>
                  </label>
                  <input type="date" v-model="detail.start_date" :disabled="isViewMode" class="input-form mt-2" />
                  <p v-if="errors[`order_details.${index}.start_date`]" class="text-xs text-red-500 mt-1">
                    {{ errors[`order_details.${index}.start_date`][0] }}
                  </p>
                </div> -->

                <!-- End Date -->
                <!-- <div>
                  <label class="text-xs font-bold text-gray-700 dark:text-gray-200">
                    {{ t('orders.fields.end_date') }} <span class="text-red-500">*</span>
                  </label>
                  <input type="date" v-model="detail.end_date" :disabled="isViewMode" class="input-form mt-2" />
                  <p v-if="errors[`order_details.${index}.end_date`]" class="text-xs text-red-500 mt-1">
                    {{ errors[`order_details.${index}.end_date`][0] }}
                  </p>
                </div> -->

               



                <!-- Is Active -->
                <!-- <div class="flex items-center mt-6">
                  <input type="checkbox" v-model="detail.is_active" :disabled="isViewMode" class="mr-2" />
                  <label class="text-xs font-bold text-gray-700 dark:text-gray-200">{{ t('orders.fields.is_active') }}</label>
                </div> -->

               
                <!-- Enhanced Package Features Section - Full Width -->
                <div class="lg:col-span-3">
                  <div class="flex items-center justify-between mb-2">
                    <label class="text-sm font-bold text-gray-900 dark:text-white">
                      {{ t('orders.fields.features') }}
                    </label>
                    <!-- <div v-if="!isViewMode" class="flex gap-2">
                      <button type="button" @click="resetFeaturesToDefault(index)"
                        class="inline-flex items-center px-2 py-1 text-xs font-medium text-orange-700 bg-orange-100 border border-orange-200 rounded hover:bg-orange-200 transition">
                        <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        {{ t('orders.reset_features') }}
                      </button>
                    </div> -->
                  </div>

                  <!-- Compact Features List -->
                  <div v-if="detail.features && detail.features.length > 0"
                    class="max-h-64 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900">

                    <!-- Table Header -->
                    <div
                      class="grid grid-cols-12 gap-2 p-2 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-600 sticky top-0">
                      <div class="col-span-1 text-center">{{ t('orders.display_order') }}</div>
                      <div class="col-span-3">{{ t('orders.feature_name') }}</div>
                      <div class="col-span-2">{{ t('orders.feature_type') }}</div>
                      <div class="col-span-2">{{ t('orders.limit_value') }}</div>
                      <div class="col-span-2">{{ t('orders.unit') }}</div>
                      <div class="col-span-1 text-center">{{ t('orders.actions') }}</div>
                    </div>

                    <!-- Feature Rows -->
                    <div v-for="(feature, featureIndex) in detail.features"
                      :key="feature.id || feature.temp_id || featureIndex"
                      class="grid grid-cols-12 gap-2 p-2 text-xs border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      :class="{ 'opacity-60': feature.is_active === false }">

                      <!-- Display Order -->
                      <div class="col-span-1 text-center">{{ feature.display_order }}</div>

                      <!-- Feature Name & Key -->
                      <div class="col-span-3">
                        <div class="font-medium text-gray-900 dark:text-white truncate" :title="feature.feature_name">
                          {{ feature.feature_name }}
                        </div>
                        <div class="text-gray-500 dark:text-gray-400 truncate text-xs" :title="feature.feature_key">
                          {{ feature.feature_key }}
                        </div>
                      </div>

                      <!-- Feature Type & Unit -->
                      <div class="col-span-2">
                        <div class="text-gray-800 dark:text-gray-200">
                          {{ formatOptionLabel(featureTypeOption, feature.feature_type) }}
                        </div>
                      </div>

                      <!-- Limit Value -->
                      <div class="col-span-2">
                        <div v-if="feature.is_active !== false">
                          <!-- Boolean Type -->
                          <div v-if="feature.feature_type === 'boolean'" class="flex items-center">
                            <input type="checkbox" v-model="feature.limit_value_boolean"
                              :disabled="isViewMode || !feature.is_customizable"
                              @change="onFeatureLimitChange(index, featureIndex)"
                              class="form-checkbox h-3 w-3 text-indigo-600 rounded"
                              :class="{ 'cursor-not-allowed': !feature.is_customizable }" />
                            <span class="ml-1 text-xs">
                              <!-- {{ Number(feature.limit_value_boolean) ? t('orders.enabled') : t('orders.disabled') }} -->
                            </span>
                            <span v-if="!feature.is_customizable" class="ml-1 text-gray-400" title="Không thể sửa">
                              <svg class="w-3 h-3 inline" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd"
                                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                                  clip-rule="evenodd" />
                              </svg>
                            </span>
                          </div>

                          <!-- Quantity Type -->
                          <div v-else-if="feature.feature_type === 'quantity'" class="flex items-center">
                            <input type="number" step="0.01" min="0" v-model.number="feature.limit_value"
                              :disabled="isViewMode || !feature.is_customizable"
                              @input="onFeatureLimitChange(index, featureIndex)"
                              class="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                              :class="{
                                'bg-gray-100 dark:bg-gray-600 cursor-not-allowed': !feature.is_customizable,
                                'border-blue-300 dark:border-blue-500': feature.is_customizable
                              }" />
                            <span v-if="!feature.is_customizable" class="ml-1 text-gray-400" title="Không thể sửa">
                              <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd"
                                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                                  clip-rule="evenodd" />
                              </svg>
                            </span>
                          </div>

                          <!-- Other Types -->
                          <div v-else class="flex items-center">
                            <span class="text-gray-800 dark:text-gray-200">
                              {{ feature.limit_value }} {{ feature.unit || '' }}
                            </span>
                            <span v-if="!feature.is_customizable" class="ml-1 text-gray-400" title="Không thể sửa">
                              <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd"
                                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                                  clip-rule="evenodd" />
                              </svg>
                            </span>
                          </div>
                        </div>
                        <div v-else class="text-gray-500 dark:text-gray-400 italic">

                          {{ Number(feature.limit_value) }}
                        </div>
                      </div>
                      <div class="col-span-2 text-left">
                        <div v-if="feature.unit" class="text-gray-500 dark:text-gray-400">
                          {{ formatOptionLabel(unitTypeOptions, feature.unit) }}
                        </div>
                      </div>

                      <!-- Status Badges -->

                      <!-- Actions -->
                      <div class="col-span-1 text-center">
                        <div v-if="!isViewMode" class="flex items-center justify-center gap-1">
                          <!-- Delete Feature (for optional features) -->
                          <div v-if="feature.is_optional && feature.is_active">
                            <button type="button" @click="removeOptionalFeature(index, featureIndex)"
                              class="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 ml-1"
                              title="Xóa feature">
                              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clip-rule="evenodd" />
                                <path fill-rule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                  clip-rule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>

                      <!-- Expandable Original Value (if modified) -->
                      <div v-if="feature.is_modified && feature.original_limit_value !== undefined"
                        class="col-span-12 mt-1 text-xs text-gray-500 dark:text-gray-400 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded border-l-2 border-yellow-400">
                        <strong>{{ t('orders.original_value') }} : </strong>
                        <span v-if="feature.feature_type === 'boolean'">
                          <input type="checkbox" v-model="feature.original_limit_value" :disabled="true"
                            class="form-checkbox h-3 w-3 text-indigo-600 rounded"
                            :class="{ 'cursor-not-allowed': true }" />
                        </span>
                        <span v-else>
                          {{ feature.original_limit_value }}
                        </span>
                      </div>
                    </div>
                  </div>

                  <!-- Empty Features State -->
                  <div v-else
                    class="text-xs text-gray-500 dark:text-gray-400 p-4 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-center">
                    {{ t('orders.no_features') }}
                    <br>
                    <span class="text-indigo-600 dark:text-indigo-400">
                      {{ t('orders.select_package_to_see_features') }}
                    </span>
                  </div>

                  <!-- Features Error Display -->
                  <p v-if="errors[`order_details.${index}.features`]" class="text-xs text-red-500 mt-2">
                    {{ errors[`order_details.${index}.features`][0] }}
                  </p>

                </div>
              </div>
            </div>
          </div>

          <!-- Order Details Summary -->
          <div v-if="formData.order_details.length > 0"
            class="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 class="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">{{ t('orders.summary') }}</h4>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div>
                <span class="text-gray-600 dark:text-gray-400">{{ t('orders.subtotal') }}:</span>
                <div class="font-medium text-gray-700 dark:text-gray-300">{{ formatCurrency(orderSubtotal) }}</div>
              </div>
              <div>
                <span class="text-gray-600 dark:text-gray-400">{{ t('orders.total_tax') }}:</span>
                <div class="font-medium text-gray-700 dark:text-gray-300">{{ formatCurrency(orderTaxTotal) }}</div>
              </div>
              <div>
                <span class="text-gray-600 dark:text-gray-400">{{ t('orders.total_amount') }}:</span>
                <div class="font-bold text-blue-700 dark:text-blue-300">{{ formatCurrency(orderTotal) }}</div>
              </div>
              <div>
                <span class="text-gray-600 dark:text-gray-400">{{ t('orders.items_count') }}:</span>
                <div class="font-medium text-gray-700 dark:text-gray-300">{{ formData.order_details.length }}</div>
              </div>
            </div>
          </div>
        </fieldset>
        <!-- Action Buttons -->
        <div class="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button type="button" @click="handleClose"
            class="px-4 py-2 text-xs font-medium text-gray-700 dark:text-gray-100 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition">
            {{ isViewMode ? t('common.close') : t('common.cancel') }}
          </button>
          <button v-if="!isViewMode" type="submit" :disabled="isSubmitting || hasErrors"
            class="px-4 py-2 text-xs font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition">
            <span v-if="isSubmitting" class="inline-flex items-center">
              <svg class="animate-spin -ml-1 mr-2 h-3 w-3 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                </path>
              </svg>
              {{ t('common.saving') }}
            </span>
            <span v-else>
              {{ isEditMode ? t('common.update') : t('common.save') }}
            </span>
          </button>
        </div>
      </form>
    </template>
  </BaseModal>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, inject } from 'vue'
import { useI18n } from 'vue-i18n'
import { api } from '@/utils/api'
import BaseModal from '@/components/modals/BaseModal.vue'
import SelectSearch from '@/components/forms/SelectSearch.vue'
import { notificationService } from '@/services/notification'

const { t } = useI18n()
const setLoading = inject('setLoading', () => { })


// ==================== PROPS & EMITS ====================
const props = defineProps({
  isModalOpen: Boolean,
  mode: {
    type: String,
    default: 'add',
    validator: value => ['add', 'edit', 'view'].includes(value)
  },
  currentOrder: {
    type: Object,
    default: () => ({})
  },
  categorySystem: {
    type: Object
  }
})

const emit = defineEmits(['close', 'submit', 'openAddCustomer'])

// ==================== REACTIVE STATE ====================
const servicePackageCache = ref(new Map())
const loadingServiceTypes = ref(new Set())
// Form state
const formData = ref({
  id: null,
  order_code: '',
  customer_id: null,
  opportunity_id: null,
  order_status: 'draft',
  currency: 'VND',
  total_amount: 0,
  billing_cycle: null,
  contract_id: null,
  team_id: null,
  order_details: []
})

const errors = ref({})
const isSubmitting = ref(false)

// Customer state
const customerSearchCode = ref('')
const selectedCustomer = ref(null)

// Options state
const statusOptions = ref([])
const currencyOptions = ref([])
const serviceTypeOptions = ref([])
const unitTypeOptions = ref([])
const featureTypeOption = ref([])


const billingCycleOptions = ref([
  { value: 'monthly', label: t('orders.billing_cycle.monthly') },
  { value: 'quarterly', label: t('orders.billing_cycle.quarterly') },
  { value: 'yearly', label: t('orders.billing_cycle.yearly') },
  { value: 'one_time', label: t('orders.billing_cycle.one_time') }
])
const opportunityOptions = ref([])
const contractOptions = ref([])

// ==================== COMPUTED PROPERTIES ====================
const isViewMode = computed(() => props.mode === 'view')
const isEditMode = computed(() => props.mode === 'edit')
const isCreateMode = computed(() => props.mode === 'create')
const hasErrors = computed(() => Object.keys(errors.value).length > 0)

// Order calculations
const orderSubtotal = computed(() => {
  return formData.value.order_details.reduce((sum, detail) => {
    return sum + (parseFloat(detail.total_price) || 0)
  }, 0)
})

const orderTaxTotal = computed(() => {
  return formData.value.order_details.reduce((sum, detail) => {
    return sum + (parseFloat(detail.tax_amount) || 0)
  }, 0)
})

const orderTotal = computed(() => {
  return formData.value.order_details.reduce((sum, detail) => {
    return sum + (parseFloat(detail.total_with_tax) || 0)
  }, 0)
})
const searchServicePackage = async (query) => {
  // Mock implementation - replace with actual API call
  console.log('Searching service packages:', query)
}



// ==================== FORM MANAGEMENT ====================
const resetForm = () => {
  customerSearchCode.value = ''
  selectedCustomer.value = null

  formData.value = {
    id: null,
    order_code: '',
    customer_id: null,
    opportunity_id: null,
    order_status: 'draft',
    currency: 'VND',
    total_amount: 0,
    billing_cycle: null,
    contract_id: null,
    team_id: null,
    order_details: []
  }
  errors.value = {}
}

const initializeForm = async () => {
  if (isInitializing.value) return
  isInitializing.value = true

  try {
    await Promise.all([
      loadCurrencyOptions(),
      loadOrderStatusOptions(),
      loadServiceTypeOptions(),
      loadUnitOptions(),
      loadFeatureTypeOptions()
    ])

    if (props.currentOrder && Object.keys(props.currentOrder).length > 0) {
      formData.value = {
        ...formData.value,
        ...props.currentOrder,
        order_details: props.currentOrder.details || props.currentOrder.order_details || []
      }

      if (props.currentOrder.customer) {
        selectedCustomer.value = props.currentOrder.customer
        customerSearchCode.value = props.currentOrder.customer.customer_code || ''
      }

      const serviceTypesToLoad = new Set()
      formData.value.order_details.forEach(detail => {
        if (detail.service_type) {
          const customerType = selectedCustomer.value?.customer_type || props.categorySystem?.customer_type || 'INDIVIDUAL'
          const cacheKey = `${detail.service_type}_${customerType}`
          if (!servicePackageCache.value.has(cacheKey)) {
            serviceTypesToLoad.add(detail.service_type)
          }
        }
      })

      // Load only new service types
      for (const serviceType of serviceTypesToLoad) {
        const firstDetailIndex = formData.value.order_details.findIndex(d => d.service_type === serviceType)
        if (firstDetailIndex !== -1) {
          await onServiceTypeChange(firstDetailIndex, serviceType)
        }
      }
    } else {
      resetForm()
    }

    errors.value = {}
  } finally {
    isInitializing.value = false
  }
}

// ==================== VALIDATION ====================
const validateForm = () => {
  const newErrors = {}

  // Required fields validation
  if (!formData.value.customer_id) {
    newErrors.customer_id = [t('validation.required', { field: t('orders.fields.customer') })]
    notificationService.error(newErrors.customer_id[0])
  }

  if (!formData.value.order_status) {
    newErrors.order_status = [t('validation.required', { field: t('orders.fields.order_status') })]
    notificationService.error(newErrors.order_status[0])
  }

  if (!formData.value.currency) {
    newErrors.currency = [t('validation.required', { field: t('orders.fields.currency') })]
    notificationService.error(newErrors.currency[0])
  }

  // Order details validation
  if (formData.value.order_details.length === 0) {
    newErrors.order_details = [t('orders.validation.at_least_one_detail')]
    notificationService.error(newErrors.order_details[0])
  }

  // Validate each order detail
  formData.value.order_details.forEach((detail, index) => {
    if (!detail.service_type) {
      newErrors[`order_details.${index}.service_type`] = [t('validation.required', { field: t('service_packages.fields.type_service') })]
    }
    if (!detail.service_package_id) {
      newErrors[`order_details.${index}.service_package_id`] = [t('validation.required')]
    }
    if (!detail.quantity || detail.quantity < 1) {
      newErrors[`order_details.${index}.quantity`] = [t('orders.validation.min', { min: 1 })]
    }
    // Date validation
    if (detail.start_date && detail.end_date && detail.start_date > detail.end_date) {
      newErrors[`order_details.${index}.end_date`] = [t('orders.validation.end_date_after_start')]
    }
  })

  errors.value = newErrors
  return Object.keys(newErrors).length === 0
}

const validateAllFeatures = () => {
  let isValid = true
  formData.value.order_details.forEach((detail, detailIndex) => {
    if (detail.features) {
      detail.features.forEach((feature, featureIndex) => {
        if (feature.is_active && !validateFeatureLimit(detailIndex, featureIndex)) {
          isValid = false
        }
      })
    }
  })
  return isValid
}

const validateFeatureLimit = (orderDetailIndex, featureIndex) => {
  const feature = formData.value.order_details[orderDetailIndex].features[featureIndex]
  const errorKey = `order_details.${orderDetailIndex}.features.${featureIndex}.limit_value`

  // Clear previous errors
  if (errors.value[errorKey]) {
    delete errors.value[errorKey]
  }

  if (feature.feature_type === 'quantity') {
    // Validate minimum value
    if (feature.limit_value < 0) {
      errors.value[errorKey] = [t('orders.validation.feature_limit_min_zero')]
      return false
    }

    // Custom validation based on feature key
    switch (feature.feature_key) {
      case 'max_users':
        if (feature.limit_value > 10000) {
          errors.value[errorKey] = [t('orders.validation.max_users_limit')]
          return false
        }
        break
      case 'storage_size':
        if (feature.limit_value > 1000) { // GB
          errors.value[errorKey] = [t('orders.validation.storage_limit')]
          return false
        }
        break
    }
  }

  return true
}

// ==================== ORDER DETAILS MANAGEMENT ====================
const addOrderDetail = () => {
  delete errors.value.order_details
  const newDetail = {
    temp_id: Date.now() + Math.random(),
    service_type: null,
    service_package_id: null,
    package_code: '',
    package_name: '',
    base_price: 0,
    quantity: 1,
    total_price: 0,
    currency: formData.value.currency,
    start_date: '',
    end_date: '',
    is_active: true,
    tax_rate: 0,
    tax_included: false,
    tax_amount: 0,
    total_with_tax: 0,
    features: [],
    servicePackageOptions: ref([])
  }
  formData.value.order_details.push(newDetail)
}

const removeOrderDetail = (index) => {
  formData.value.order_details.splice(index, 1)
  calculateOrderTotal()
}

const onServiceTypeChange = async (detailIndex, serviceType) => {
  if (!serviceType) return

  const detail = formData.value.order_details[detailIndex]
  const currentServiceType = detail.service_type

  // Only reset when service type actually changes
  if (currentServiceType && currentServiceType !== serviceType) {
    detail.service_package_id = null
    detail.package_code = ''
    detail.package_name = ''
    detail.base_price = 0
  }

  detail.service_type = serviceType

  const customerType = selectedCustomer.value?.customer_type || props.categorySystem?.customer_type || 'INDIVIDUAL'
  const cacheKey = `${serviceType}_${customerType}`
  try {

    // Check cache first
    if (servicePackageCache.value.has(cacheKey)) {
      const cachedData = servicePackageCache.value.get(cacheKey)
      detail.servicePackageOptions = cachedData

      // Validate current selection
      if (detail.service_package_id) {
        const selectedPackage = detail.servicePackageOptions.find(pkg => pkg.value === detail.service_package_id)
        if (selectedPackage) {
          updateDetailFromPackage(detail, selectedPackage)
        }
      }

      calculateDetailTotals(detailIndex)
      return
    }

    // Prevent concurrent requests
    if (loadingServiceTypes.value.has(cacheKey)) {
      return
    }

    loadingServiceTypes.value.add(cacheKey)
    setLoading(true)

    const urlFilter = `type_service=${serviceType}&per_page=100&is_active=true&customer_type=${customerType}&order_by=display_order`
    const response = await api.get(`/service-packages?${urlFilter}`)
    const dataRep = response.data.data.items || []

    if (dataRep.length === 0) {
      notificationService.warning(t('orders.no_service_packages_found'))
    }

    // Update options
    const options = dataRep.map(pkg => ({
      value: pkg.id,
      label: `${pkg.package_code} - ${pkg.package_name}`,
      package: pkg
    }))

    servicePackageCache.value.set(cacheKey, options)
    detail.servicePackageOptions = options

    // Validate and update current package info
    if (detail.service_package_id) {
      const selectedPackage = detail.servicePackageOptions.find(pkg => pkg.value === detail.service_package_id)
      if (selectedPackage) {
        updateDetailFromPackage(detail, selectedPackage)
      } else {
        console.warn(`Service package ${detail.service_package_id} not found in new options`)
        notificationService.warning(t('orders.service_package_not_available'))
      }
    }

    calculateDetailTotals(detailIndex)
  } catch (error) {
    console.error('Error loading service packages:', error)
    notificationService.error(t('orders.errors.load_service_packages'))
  } finally {
    if (loadingServiceTypes.value.has(cacheKey)) {
      loadingServiceTypes.value.delete(cacheKey)
    }
    setLoading(false)
  }
}

const onServicePackageChange = async (detailIndex, packageId) => {
  if (!packageId) return

  try {
    const detail = formData.value.order_details[detailIndex]
    const selectedPackage = detail.servicePackageOptions.find(pkg => pkg.value === packageId)

    if (selectedPackage && selectedPackage.package) {
      // Update package details
      detail.package_code = selectedPackage.package.package_code
      detail.package_name = selectedPackage.package.package_name
      detail.base_price = selectedPackage.package.base_price
      detail.currency = selectedPackage.package.currency || formData.value.currency
      detail.tax_rate = selectedPackage.package.tax_rate || 0
      detail.tax_included = selectedPackage.package.tax_included || false
      detail.service_type = selectedPackage.package.type_service

      calculateDetailTotals(detailIndex)
    }

    // Load package features
    if (packageId) {
      const packageFeatures = await fetchPackageFeatures(packageId)
      formData.value.order_details[detailIndex].features = packageFeatures.map((feature, index) => ({
        id: null,
        order_detail_id: null,
        feature_key: feature.feature_key,
        feature_name: feature.feature_name,
        feature_type: feature.feature_type,
        unit: feature.unit,
        limit_value: feature.limit_value,
        is_optional: feature.is_optional,
        is_customizable: feature.is_customizable,
        display_order: feature.display_order || index + 1,
        is_active: true,
        original_limit_value: feature.limit_value,
        limit_value_boolean: feature.feature_type === 'boolean' ? Boolean(feature.limit_value) : false,
        is_modified: false,
        temp_id: generateTempId()
      }))

      // Set optional features as inactive by default
      formData.value.order_details[detailIndex].features.forEach(feature => {
        if (feature.is_optional) {
          feature.is_active = false
        }
      })
    } else {
      formData.value.order_details[detailIndex].features = []
    }
  } catch (error) {
    console.error('Error loading package features:', error)
  }
}

// ==================== FEATURE MANAGEMENT ====================
const onFeatureToggle = (orderDetailIndex, featureIndex) => {
  const feature = formData.value.order_details[orderDetailIndex].features[featureIndex]

  if (!feature.is_active) {
    resetFeatureToOriginal(orderDetailIndex, featureIndex)
  }

  calculateDetailTotals(orderDetailIndex)
}

const onFeatureLimitChange = (orderDetailIndex, featureIndex) => {
  const feature = formData.value.order_details[orderDetailIndex].features[featureIndex]

  let currentValue
  if (feature.feature_type === 'boolean') {
    currentValue = Number(feature.limit_value_boolean) ? 1 : 0
    feature.limit_value = currentValue
  } else {
    currentValue = feature.limit_value
  }

  feature.is_modified = currentValue !== feature.original_limit_value

  if (feature.feature_type === 'quantity' && feature.is_customizable) {
    validateFeatureLimit(orderDetailIndex, featureIndex)
  }

  calculateDetailTotals(orderDetailIndex)
}

const resetFeatureToOriginal = (orderDetailIndex, featureIndex) => {
  const feature = formData.value.order_details[orderDetailIndex].features[featureIndex]

  feature.limit_value = feature.original_limit_value
  if (feature.feature_type === 'boolean') {
    feature.limit_value_boolean = Boolean(feature.original_limit_value)
  }
  feature.is_modified = false

  const errorKey = `order_details.${orderDetailIndex}.features.${featureIndex}.limit_value`
  if (errors.value[errorKey]) {
    delete errors.value[errorKey]
  }
}

const resetFeaturesToDefault = (orderDetailIndex) => {
  const features = formData.value.order_details[orderDetailIndex].features

  if (confirm(t('orders.confirm_reset_features'))) {
    features.forEach((feature, index) => {
      resetFeatureToOriginal(orderDetailIndex, index)
      if (feature.is_optional) {
        feature.is_active = false
      }
    })
    calculateDetailTotals(orderDetailIndex)
  }
}

// ==================== CALCULATIONS ====================
const calculateDetailTotals = (detailIndex) => {
  const detail = formData.value.order_details[detailIndex]

  // Calculate base total
  detail.total_price = (parseFloat(detail.base_price) || 0) * (parseInt(detail.quantity) || 0)

  // Add feature-based pricing adjustments
  const featureAdjustment = calculateFeaturePricing(detailIndex)
  detail.total_price += featureAdjustment

  // Calculate tax
  const taxRate = parseFloat(detail.tax_rate) || 0
  if (detail.tax_included) {
    detail.tax_amount = detail.total_price * (taxRate / (100 + taxRate))
    detail.total_with_tax = detail.total_price
  } else {
    detail.tax_amount = detail.total_price * (taxRate / 100)
    detail.total_with_tax = detail.total_price + detail.tax_amount
  }

  calculateOrderTotal()
}

const calculateOrderTotal = () => {
  formData.value.total_amount = orderTotal.value
}

const calculateFeaturePricing = (orderDetailIndex) => {
  const detail = formData.value.order_details[orderDetailIndex]
  let featureAdjustment = 0

  if (detail.features) {
    detail.features.forEach(feature => {
      if (feature.is_active && feature.is_modified) {
        const pricingRule = getFeaturePricingRule(feature.feature_key)
        if (pricingRule) {
          const originalValue = feature.original_limit_value
          const currentValue = feature.feature_type === 'boolean' ?
            (Number(feature.limit_value_boolean) ? 1 : 0) : feature.limit_value
          featureAdjustment += pricingRule.calculate(originalValue, currentValue)
        }
      }
    })

  }

  return featureAdjustment
}

const getFeaturePricingRule = (featureKey) => {
  const pricingRules = {
    'max_users': {
      calculate: (original, current) => Math.max(0, current - original) * 5
    },
    'storage_size': {
      calculate: (original, current) => Math.max(0, current - original) * 2
    }
  }
  return pricingRules[featureKey] || null
}
const removeOptionalFeature = (orderDetailIndex, featureIndex) => {
  const detail = formData.value.order_details[orderDetailIndex]
  const feature = detail.features[featureIndex]

  if (feature.is_optional) {
    detail.features.splice(featureIndex, 1)
    calculateDetailTotals(orderDetailIndex)
  } else {
    notificationService.warning(t('orders.errors.cannot_remove_required_feature'))
  }
}

// ==================== API CALLS ====================
const fetchPackageFeatures = async (packageId) => {
  try {
    const response = await api.get(`/service-packages/${packageId}/features`)
    return response.data.data || []
  } catch (error) {
    console.error('Error fetching package features:', error)
    return []
  }
}

const searchCustomerByCode = async () => {
  if (!customerSearchCode.value) return

  try {
    setLoading(true)
    const response = await api.get(`/customers/code/${customerSearchCode.value}`)
    const data = response.data.data

    if (data) {
      selectedCustomer.value = data
      formData.value.customer_id = data.id
      formData.value.team_id = data.team_id
      formData.value.opportunity_id = data.opportunity_id
      delete errors.value.customer_id
    } else {
      notificationService.error(t('orders.errors.customer_not_found'))
    }
  } catch (error) {
    console.error('Customer search error:', error)
    notificationService.error(t('orders.errors.customer_search_failed'))
  } finally {
    setLoading(false)
  }
}

// ==================== OPTIONS LOADING ====================
const loadCurrencyOptions = async (newSystem = props.categorySystem) => {
  if (newSystem && newSystem.loaded) {
    currencyOptions.value = newSystem.getItemsByTypeCode('CURRENCY_TYPE').map((item) => ({
      label: item.name,
      value: item.code
    }))
  }
}

const loadOrderStatusOptions = async (newSystem = props.categorySystem) => {
  if (newSystem && newSystem.loaded) {
    statusOptions.value = newSystem.getItemsByTypeCode('order_status').map((item) => ({
      label: item.name,
      value: item.code
    }))
  }
}

const loadServiceTypeOptions = async (newSystem = props.categorySystem) => {
  if (newSystem && newSystem.loaded) {
    serviceTypeOptions.value = newSystem.getItemsByTypeCode('service_type').map((item) => ({
      label: item.name,
      value: item.code
    }))
  }
}

const loadUnitOptions = async (newSystem = props.categorySystem) => {
  if (newSystem && newSystem.loaded) {
    unitTypeOptions.value = newSystem.getItemsByTypeCode('unit_type').map((item) => ({
      label: item.name,
      value: item.code
    }))
  }
}
const loadFeatureTypeOptions = async (newSystem = props.categorySystem) => {
  if (newSystem && newSystem.loaded) {
    featureTypeOption.value = newSystem.getItemsByTypeCode('feature_type').map((item) => ({
      label: item.name,
      value: item.code
    }))
  }
}


// ==================== FORM SUBMISSION ====================
const updateDetailFromPackage = (detail, selectedPackage) => {
  detail.package_code = selectedPackage.package.package_code
  detail.package_name = selectedPackage.package.package_name
  detail.base_price = selectedPackage.package.base_price
  detail.currency = selectedPackage.package.currency || formData.value.currency
  detail.tax_rate = selectedPackage.package.tax_rate || 0
  detail.tax_included = selectedPackage.package.tax_included || false
}
const handleSubmit = async () => {
  if (!validateForm() || !validateAllFeatures()) return

  isSubmitting.value = true

  try {
    const submitData = {
      ...formData.value,
      order_details: prepareOrderDetailsForSubmit()
    }

    emit('submit', { submitData })
  } catch (error) {
    console.error('Form submission error:', error)
  } finally {
    isSubmitting.value = false
  }
}

const prepareOrderDetailsForSubmit = () => {
  return formData.value.order_details.map(detail => ({
    ...detail,
    features: detail.features?.map(feature => ({
      id: feature.id || null,
      feature_key: feature.feature_key,
      feature_name: feature.feature_name,
      feature_type: feature.feature_type,
      unit: feature.unit,
      limit_value: feature.feature_type === 'boolean' ?
        (Number(feature.limit_value_boolean) ? 1 : 0) : feature.limit_value,
      is_optional: feature.is_optional,
      is_customizable: feature.is_customizable,
      is_active: feature.is_active,
      display_order: feature.display_order
    })).filter(feature => feature.is_active !== false) || []
  }))
}

// ==================== EVENT HANDLERS ====================
const handleClose = () => {
  resetForm()
  emit('close')
}

const openAddCustomer = () => {
  emit('openAddCustomer')
}

// ==================== UTILITY FUNCTIONS ====================
const generateTempId = () => {
  return 'temp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
}

const getFeatureLimitLabel = (featureType) => {
  switch (featureType) {
    case 'quantity':
      return t('orders.limit_value')
    case 'boolean':
      return t('orders.enabled_status')
    default:
      return t('orders.value')
  }
}

const formatDatetime = (datetimeStr) => {
  if (!datetimeStr) datetimeStr = new Date().toISOString()
  const date = new Date(datetimeStr)
  const pad = (n) => n.toString().padStart(2, '0')
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())} ${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`
}

const formatCurrency = (amount) => {
  const currency = formData.value.currency || 'VND'
  return new Intl.NumberFormat('vi', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2
  }).format(amount || 0)
}
const formatOptionLabel = (options, value) => {
  if (!options || !Array.isArray(options) || options.length === 0) return ''
  const found = options.find(o => o.value === value);
  return found?.label || '';
};

// ==================== WATCHERS ====================
let initializationPromise = null

watch(() => props.isModalOpen, async (newVal) => {
  if (newVal && !initializationPromise) {
    initializationPromise = initializeForm()
    await initializationPromise
    initializationPromise = null
  } else if (!newVal) {
    initializationPromise = null
    // Clear cache when modal closes (optional)
    servicePackageCache.value.clear()
  }
})

const isInitializing = ref(false)

watch(() => props.currentOrder, async (newOrder, oldOrder) => {
  if (JSON.stringify(newOrder) === JSON.stringify(oldOrder)) return
  if (isInitializing.value) return // 

  isInitializing.value = true

  try {
    if (newOrder && Object.keys(newOrder).length > 0) {
      formData.value = {
        ...formData.value,
        ...newOrder,
        order_details: newOrder.details || newOrder.order_details || []
      }

      customerSearchCode.value = newOrder.customer?.customer_code || ''
      selectedCustomer.value = newOrder.customer || null

      const serviceTypesToLoad = new Set()
      formData.value.order_details.forEach(detail => {
        if (detail.service_type) {
          serviceTypesToLoad.add(detail.service_type)
        }
      })

      for (const serviceType of serviceTypesToLoad) {
        const customerType = selectedCustomer.value?.customer_type || props.categorySystem?.customer_type || 'INDIVIDUAL'
        const cacheKey = `${serviceType}_${customerType}`

        if (!servicePackageCache.value.has(cacheKey) && !loadingServiceTypes.value.has(cacheKey)) {
          await onServiceTypeChange(0, serviceType) // Load once
        }
      }

      // Then update all details
      for (let index = 0; index < formData.value.order_details.length; index++) {
        const detail = formData.value.order_details[index]
        if (detail.service_type) {
          const customerType = selectedCustomer.value?.customer_type || props.categorySystem?.customer_type || 'INDIVIDUAL'
          const cacheKey = `${detail.service_type}_${customerType}`

          if (servicePackageCache.value.has(cacheKey)) {
            detail.servicePackageOptions = servicePackageCache.value.get(cacheKey)

            if (detail.service_package_id) {
              const selectedPackage = detail.servicePackageOptions.find(pkg => pkg.value === detail.service_package_id)
              if (selectedPackage) {
                updateDetailFromPackage(detail, selectedPackage)
              }
            }
            calculateDetailTotals(index)
          }
        }
      }
    } else {
      resetForm()
    }
  } finally {
    isInitializing.value = false
  }
}, { deep: true })

watch(() => formData.value.currency, (newCurrency) => {
  formData.value.order_details.forEach(detail => {
    detail.currency = newCurrency
  })
})

// ==================== LIFECYCLE ====================
onMounted(async () => {
  if (props.isModalOpen) {
    await initializeForm()
  }
})
onUnmounted(() => {
  servicePackageCache.value.clear()
  loadingServiceTypes.value.clear()
})
</script>

<style scoped>
.input-form {
  @apply block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-xs;
}

.input-form:disabled {
  @apply bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed;
}

/* Custom scrollbar for modal content */
.modal-content::-webkit-scrollbar {
  width: 6px;
}

.modal-content::-webkit-scrollbar-track {
  @apply bg-gray-100 dark:bg-gray-800;
}

.modal-content::-webkit-scrollbar-thumb {
  @apply bg-gray-400 dark:bg-gray-600 rounded-full;
}

.modal-content::-webkit-scrollbar-thumb:hover {
  @apply bg-gray-500 dark:bg-gray-500;
}
</style>
<!-- 
<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import BaseModal from '@/components/modals/BaseModal.vue'
import SelectSearch from '@/components/forms/SelectSearch.vue'
import OrderDetailsTable from '@/modules/order/components/OrderDetailsTable.vue'
// import CustomerInfoCard from '@/modules/customer/components/CustomerInfoCard.vue'


const { t } = useI18n()

const props = defineProps({
  isModalOpen: Boolean,
  errors: { type: Object, default: () => ({}) },
  mode: { type: String, default: 'add', validator: (v: string) => ['add', 'edit', 'view'].includes(v) },
  currentOrder: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['close', 'submit', 'open-customer-modal'])

const statusOptions = ref([
  { value: 'draft', label: t('orders.status.draft') },
  { value: 'pending', label: t('orders.status.pending') },
  { value: 'completed', label: t('orders.status.completed') },
  { value: 'cancelled', label: t('orders.status.cancelled') }
])
const teamOptions = ref([])
const customerOptions = ref([])
const currencyOptions = ref([
  { value: 'VND', label: 'VND' },
  { value: 'USD', label: 'USD' }
])

const selectedCustomer = ref<any>(null)
const isEditMode = computed(() => props.mode === 'edit')
const isViewMode = computed(() => props.mode === 'view')
const hasErrors = computed(() =>
  !formData.value.customer_id ||
  !formData.value.order_status ||
  !formData.value.order_details.length
)

const formData = ref({
  id: null,
  order_code: '',
  customer_id: '',
  order_status: 'draft',
  order_date: '',
  team_id: '',
  currency: 'VND',
  order_details: []
})

// ---------- INIT DATA ----------
const initData = () => {
  formData.value = {
    id: null,
    order_code: '',
    customer_id: '',
    order_status: 'draft',
    order_date: '',
    team_id: '',
    currency: 'VND',
    order_details: []
  }
  selectedCustomer.value = null
}

const handleClose = () => {
  initData()
  emit('close')
}

const handleSubmit = () => {
  if (hasErrors.value) return
  emit('submit', { ...formData.value })
}

const openAddCustomer = () => emit('open-customer-modal')

const searchCustomer = async (query: string) => {
  try {
    const res = await api.get('/customers', { params: { query } })
    customerOptions.value = res.data.data.items.map((c: any) => ({
      label: `${c.full_name} - ${c.contacts?.[0]?.value || ''}`,
      value: c.id
    }))
  } catch (error) {
    customerOptions.value = []
  }
}

const fetchTeams = async () => {
  try {
    const res = await api.get('/teams')
    teamOptions.value = res.data.data.items.map((team: any) => ({
      label: team.name,
      value: team.id
    }))
  } catch (error) {
    teamOptions.value = []
  }
}

const loadCustomerDetails = async (customerId: string | null) => {
  if (!customerId) {
    selectedCustomer.value = null
    return
  }
  try {
    const res = await api.get(`/customers/${customerId}`)
    selectedCustomer.value = res.data.data
  } catch (error) {
    selectedCustomer.value = null
  }
}

// ---------- WATCHERS ----------
watch(() => formData.value.customer_id, (val) => {
  loadCustomerDetails(val)
})

watch(() => props.currentOrder, (order) => {
  if (!order || !Object.keys(order).length) {
    initData()
    return
  }
  formData.value = {
    id: order.id || null,
    order_code: order.order_code || '',
    customer_id: order.customer_id || '',
    order_status: order.order_status || 'draft',
    order_date: order.order_date || '',
    team_id: order.team_id || '',
    currency: order.currency || 'VND',
    order_details: order.order_details || []
  }
  // if (order.customer) {
  //   selectedCustomer.value = order.customer
  //   if (!customerOptions.value.some(opt => opt.value === order.customer_id)) {
  //     customerOptions.value.push({
  //       label: `${order.customer.full_name} - ${order.customer.contacts?.[0]?.value || ''}`,
  //       value: order.customer_id
  //     })
  //   }
  // }
}, { immediate: true })

onMounted(() => {
  fetchTeams()
  searchCustomer('')
})
</script>

<style scoped>
.input-form {
  @apply w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-xs shadow-sm focus:outline-none focus:ring focus:ring-blue-200 dark:focus:ring-blue-600;
}
</style> -->
