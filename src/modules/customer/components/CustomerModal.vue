<template>
    <BaseModal :show="isModalOpen" :close="closeModal" :size="modalSize" :closeOnClickOutside="false">
        <!-- Header: Tiêu đề + customer_code (view-only) -->
        <template #header>
            <div>
                <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
                    {{
                        isViewMode ? t('customers.view_title') :
                            isEditMode ? t('customers.edit_title') :
                                t('customers.add_title')
                    }}
                </h3>

            </div>
        </template>

        <template #body>
            <!-- customer_code chỉ view, nổi bật, căn trái -->
            <div v-if="isViewMode" class="mx-4  flex items-center gap-2">
                <span class="font-semibold text-xs text-gray-500 uppercase tracking-widest">
                    {{ t('customers.fields.customer_code') }}:
                </span>
                <span
                    class="text-xs bg-gray-100 dark:bg-gray-700 text-blue-700 dark:text-blue-300 px-3 py-1 rounded border border-gray-200 dark:border-gray-600">
                    {{ formData.customer_code || '-' }}
                </span>
            </div>
            <div class="border-b border-gray-200 dark:border-gray-700 mx-4">
                <nav class="-mb-px flex space-x-8">
                    <button v-for="tab in tabs" :key="tab.name" @click="currentTab = tab.name" :class="[
                        'whitespace-nowrap py-3 px-2 border-b-2 font-medium text-xs transition',
                        currentTab === tab.name
                            ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400'
                    ]">
                        {{ tab.label }}
                    </button>
                </nav>
            </div>
            <div v-show="currentTab === 'basic'">
                <form @submit.prevent="" class="mx-4 mt-6 space-y-6">

                    <!-- Nhóm 1: Thông tin chính -->
                    <fieldset
                        class="bg-white/70 dark:bg-gray-800/50 p-6 rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 transition-all duration-300 hover:shadow-xl">
                        <legend
                            class="text-xs font-bold text-blue-600 dark:text-blue-400 mb-4 uppercase px-3 py-1 bg-blue-50 dark:bg-blue-900/30 rounded-full border border-blue-200 dark:border-blue-700">
                            {{ t('customers.group_main') }}
                        </legend>

                        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            <!-- Trạng thái -->
                            <div class="space-y-2">
                                <label
                                    class="flex items-center text-xs font-semibold text-gray-700 dark:text-gray-200 mb-2">
                                    {{ t('status') }}
                                    <span v-if="!isViewMode" class="text-red-500 ml-1">*</span>
                                </label>
                                <SelectSearch v-model="formData.status" :options="statusOptions"
                                    :placeholder="$t('common.select')" :disabled="true" size="sm" :class="[
                                        'rounded-lg',
                                        'transition-all duration-200',
                                        'focus:outline-none',
                                        errors.status
                                            ? 'ring-2 ring-red-300'
                                            : 'hover:ring-2 hover:ring-blue-500/30 focus:ring-2 focus:ring-blue-300'
                                    ]" />
                                <p v-if="errors.status"
                                    class="text-xs text-red-500 dark:text-red-400 flex items-center gap-1">
                                    {{ errors.status[0] }}
                                </p>
                            </div>
                            <!-- Loại khách hàng -->
                            <div class="space-y-2">
                                <label
                                    class="flex items-center text-xs font-semibold text-gray-700 dark:text-gray-200 mb-2">
                                    {{ t('customers.fields.customer_type') }}
                                    <span v-if="!isViewMode" class="text-red-500 ml-1">*</span>
                                </label>
                                <SelectSearch v-model="formData.customer_type" :options="customerTypeOptions"
                                    :placeholder="$t('common.select')" :disabled="isViewMode" size="sm" :class="[
                                        'rounded-lg',
                                        'transition-all duration-200',
                                        'focus:outline-none',
                                        errors.customer_type
                                            ? 'ring-2 ring-red-300'
                                            : 'hover:ring-2 hover:ring-blue-500/30 focus:ring-2 focus:ring-blue-300'
                                    ]" />
                                <p v-if="errors.customer_type"
                                    class="text-xs text-red-500 dark:text-red-400 flex items-center gap-1">
                                    {{ errors.customer_type[0] }}
                                </p>
                            </div>
                            <!-- Team -->
                            <div class="space-y-2">
                                <label
                                    class="flex items-center text-xs font-semibold text-gray-700 dark:text-gray-200 mb-2">
                                    {{ t('customers.fields.team') }}
                                    <span v-if="!isViewMode" class="text-red-500 ml-1">*</span>
                                </label>
                                <SelectSearch v-model="formData.team_id" :options="teamOptions"
                                    :placeholder="$t('common.select')" :disabled="isViewMode" size="sm" :class="[
                                        'rounded-lg',
                                        'transition-all duration-200',
                                        'focus:outline-none',
                                        errors.team_id
                                            ? 'ring-2 ring-red-300'
                                            : 'hover:ring-2 hover:ring-blue-500/30 focus:ring-2 focus:ring-blue-300'
                                    ]" />
                                <p v-if="errors.team_id"
                                    class="text-xs text-red-500 dark:text-red-400 flex items-center gap-1">
                                    {{ errors.team_id[0] }}
                                </p>
                            </div>
                            <!-- Giao cho -->
                            <div class="space-y-2">
                                <label
                                    class="flex items-center text-xs font-semibold text-gray-700 dark:text-gray-200 mb-2">
                                    {{ t('customers.fields.assigned_to') }}
                                    <span v-if="!isViewMode" class="text-red-500 ml-1">*</span>
                                </label>
                                <SelectSearch v-model="formData.assigned_to" :options="userOptions"
                                    :placeholder="$t('common.select')" :disabled="isViewMode" size="sm" :class="[
                                        'rounded-lg',
                                        'transition-all duration-200',
                                        'focus:outline-none',
                                        errors.assigned_to
                                            ? 'ring-2 ring-red-300'
                                            : 'hover:ring-2 hover:ring-blue-500/30 focus:ring-2 focus:ring-blue-300'
                                    ]" />
                                <p v-if="errors.assigned_to"
                                    class="text-xs text-red-500 dark:text-red-400 flex items-center gap-1">
                                    {{ errors.assigned_to[0] }}
                                </p>
                            </div>


                            <!-- Loại giấy tờ -->
                            <div class="space-y-2" v-if="formData.customer_type === 'INDIVIDUAL'">
                                <label
                                    class="flex items-center text-xs font-semibold text-gray-700 dark:text-gray-200 mb-2">
                                    {{ t('customers.fields.identity_type') }}
                                    <span v-if="!isViewMode && formData.customer_type == 'INDIVIDUAL'"
                                        class="text-red-500 ml-1">*</span>
                                </label>
                                <SelectSearch v-model="formData.identity_type" :options="identityTypeOptions"
                                    :placeholder="t('common.select')" :disabled="isViewMode" size="sm" :class="[
                                        'rounded-lg',
                                        'transition-all duration-200',
                                        'focus:outline-none',
                                        errors.identity_type
                                            ? 'ring-2 ring-red-300'
                                            : 'hover:ring-2 hover:ring-indigo-500/30 focus:ring-2 focus:ring-indigo-500'
                                    ]" />
                                <p v-if="errors.identity_type"
                                    class="text-xs text-red-500 dark:text-red-400 flex items-center gap-1">
                                    {{ errors.identity_type[0] }}
                                </p>
                            </div>

                            <!-- Số giấy tờ -->
                            <div class="space-y-2" v-if="formData.customer_type === 'INDIVIDUAL'">
                                <label
                                    class="flex items-center text-xs font-semibold text-gray-700 dark:text-gray-200 mb-2">
                                    {{ t('customers.fields.identity_number') }}
                                    <span v-if="!isViewMode && formData.customer_type == 'INDIVIDUAL'"
                                        class="text-red-500 ml-1">*</span>
                                </label>
                                <div class="relative">
                                    <input type="text" v-model="formData.identity_number" :readonly="isViewMode"
                                        :placeholder="t('customers.placeholders.identity_number')" :class="[
                                            'w-full text-xs px-3 py-2 rounded-lg border transition-colors',
                                            isViewMode
                                                ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed text-gray-600 dark:text-gray-300'
                                                : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:border-indigo-300',
                                            errors.identity_number
                                                ? 'ring-2 ring-red-300'
                                                : 'border-gray-300 dark:border-gray-600'
                                        ]" />
                                </div>
                                <p v-if="errors.identity_number"
                                    class="text-xs text-red-500 dark:text-red-400 flex items-center gap-1">
                                    {{ errors.identity_number[0] }}
                                </p>
                            </div>

                            <!-- Mã số thuế -->
                            <div class="space-y-2">
                                <label
                                    class="flex items-center text-xs font-semibold text-gray-700 dark:text-gray-200 mb-2">
                                    {{ t('customers.fields.tax_code') }}
                                    <span v-if="!isViewMode && formData.customer_type == 'ORGANIZATION'"
                                        class="text-red-500 ml-1">*</span>
                                </label>
                                <div class="relative">
                                    <input type="text" v-model="formData.tax_code" :readonly="isViewMode"
                                        :placeholder="t('customers.placeholders.tax_code')" :class="[
                                            'w-full text-xs px-3 py-2 rounded-lg border transition-colors',
                                            isViewMode
                                                ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed text-gray-600 dark:text-gray-300'
                                                : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:border-indigo-300',
                                            errors.tax_code
                                                ? 'ring-2 ring-red-300'
                                                : 'border-gray-300 dark:border-gray-600'
                                        ]" />
                                </div>
                                <p v-if="errors.tax_code"
                                    class="text-xs text-red-500 dark:text-red-400 flex items-center gap-1">
                                    {{ errors.tax_code[0] }}
                                </p>
                            </div>
                            <!-- Ngành nghề -->
                            <div class="space-y-2">
                                <label
                                    class="flex items-center text-xs font-semibold text-gray-700 dark:text-gray-200 mb-2">
                                    {{ t('customers.fields.industry') }}
                                </label>
                                <div class="relative">
                                    <input type="text" v-model="formData.industry" :readonly="isViewMode"
                                        :placeholder="t('customers.placeholders.industry')" :class="[
                                            'w-full text-xs px-3 py-2 rounded-lg border transition-colors',
                                            isViewMode
                                                ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed text-gray-600 dark:text-gray-300'
                                                : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:border-indigo-300',
                                            errors.industry
                                                ? 'ring-2 ring-red-300'
                                                : 'border-gray-300 dark:border-gray-600'
                                        ]" />
                                </div>
                                <p v-if="errors.industry"
                                    class="text-xs text-red-500 dark:text-red-400 flex items-center gap-1">
                                    {{ errors.industry[0] }}
                                </p>
                            </div>
                            <!-- Tên đầy đủ -->
                            <div class="space-y-2" :class="[
                                formData.customer_type === 'ORGANIZATION' ? 'lg:col-span-2' : 'lg:col-span-1'
                            ]">
                                <label
                                    class="flex items-center text-xs font-semibold text-gray-700 dark:text-gray-200 mb-2">
                                    {{ t('customers.fields.full_name') }}
                                    <span v-if="!isViewMode" class="text-red-500 ml-1">*</span>
                                </label>
                                <div class="relative">
                                    <input type="text" v-model="formData.full_name" :readonly="isViewMode"
                                        :placeholder="formData.customer_type == 'ORGANIZATION' ? t('customers.placeholders.full_name_org') : t('customers.placeholders.full_name_in')"
                                        :class="[
                                            'w-full text-xs px-3 py-2 rounded-lg border transition-colors',
                                            isViewMode
                                                ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed text-gray-600 dark:text-gray-300'
                                                : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:border-blue-300',
                                            errors.full_name
                                                ? 'ring-2 ring-red-300'
                                                : 'border-gray-300 dark:border-gray-600'
                                        ]" />
                                </div>
                                <p v-if="errors.full_name" class="mt-1 text-xs text-red-500">
                                    {{ errors.full_name[0] }}
                                </p>
                            </div>

                            <!-- Tên ngắn -->
                            <div v-if="formData.customer_type === 'ORGANIZATION'" class="space-y-2" :class="[
                                formData.customer_type === 'ORGANIZATION' ? 'lg:col-span-1' : 'lg:col-span-2'
                            ]">
                                <label
                                    class="flex items-center text-xs font-semibold text-gray-700 dark:text-gray-200 mb-2">
                                    {{ t('customers.fields.short_name') }}
                                </label>
                                <div class="relative">
                                    <input type="text" v-model="formData.short_name" :readonly="isViewMode"
                                        :placeholder="t('customers.placeholders.short_name')" :class="[
                                            'w-full text-xs px-3 py-2 rounded-lg border transition-colors',
                                            isViewMode
                                                ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed text-gray-600 dark:text-gray-300'
                                                : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:border-blue-300',
                                            errors.short_name
                                                ? 'ring-2 ring-red-300'
                                                : 'border-gray-300 dark:border-gray-600'
                                        ]" />
                                </div>
                                <p v-if="errors.short_name"
                                    class="text-xs text-red-500 dark:text-red-400 flex items-center gap-1">

                                    {{ errors.short_name[0] }}
                                </p>
                            </div>


                            <!-- Tỉnh/Thành phố -->
                            <div class="space-y-2">
                                <label
                                    class="flex items-center text-xs font-semibold text-gray-700 dark:text-gray-200 mb-2">
                                    {{ t('customers.fields.province') }}
                                    <span v-if="!isViewMode" class="text-red-500 ml-1">*</span>
                                </label>
                                <SelectSearch v-model="formData.province_code" :options="provinceOptions"
                                    :placeholder="$t('common.select')" :disabled="isViewMode" size="sm" :class="[
                                        'rounded-lg',
                                        'transition-all duration-200',
                                        'focus:outline-none',
                                        errors.province_code
                                            ? 'ring-2 ring-red-300'
                                            : 'hover:ring-2 hover:ring-blue-500/30 focus:ring-2 focus:ring-blue-300'
                                    ]" />
                                <p v-if="errors.province_code"
                                    class="text-xs text-red-500 dark:text-red-400 flex items-center gap-1">
                                    {{ errors.province_code[0] }}
                                </p>
                            </div>
                            <!-- Địa chỉ -->
                            <div class="space-y-2 " :class="[
                                formData.customer_type === 'ORGANIZATION' ? 'lg:col-span-2' : 'lg:col-span-2'
                            ]">
                                <label
                                    class="flex items-center text-xs font-semibold text-gray-700 dark:text-gray-200 mb-2">
                                    {{ t('customers.fields.address') }}
                                    <span v-if="!isViewMode" class="text-red-500 ml-1">*</span>
                                </label>
                                <div class="relative">
                                    <input type="text" v-model="formData.address" :readonly="isViewMode"
                                        :placeholder="t('customers.placeholders.address')" :class="[
                                            'w-full text-xs px-3 py-2 rounded-lg border transition-colors',
                                            isViewMode
                                                ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed text-gray-600 dark:text-gray-300'
                                                : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:border-blue-300',
                                            errors.address
                                                ? 'ring-2 ring-red-300'
                                                : 'border-gray-300 dark:border-gray-600'
                                        ]" />
                                </div>
                                <p v-if="errors.address"
                                    class="text-xs text-red-500 dark:text-red-400 flex items-center gap-1">
                                    {{ errors.address[0] }}
                                </p>
                            </div>
                            <!-- Website (chiếm toàn bộ dòng) -->
                            <div class="space-y-2 lg:col-span-2">
                                <label
                                    class="flex items-center text-xs font-semibold text-gray-700 dark:text-gray-200 mb-2">
                                    {{ t('customers.fields.website') }}
                                </label>
                                <div class="relative">
                                    <input type="text" v-model="formData.website" :readonly="isViewMode"
                                        :placeholder="t('customers.placeholders.website')" :class="[
                                            'w-full text-xs px-3 py-2 pl-10 rounded-lg border transition-colors',
                                            isViewMode
                                                ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed text-gray-600 dark:text-gray-300'
                                                : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:border-indigo-300',
                                            errors.website
                                                ? 'ring-2 ring-red-300'
                                                : 'border-gray-300 dark:border-gray-600'
                                        ]" />
                                    <div class="absolute inset-y-0 left-0 flex items-center pl-3">
                                        <svg class="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none"
                                            stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                        </svg>
                                    </div>
                                </div>
                                <p v-if="errors.website"
                                    class="text-xs text-red-500 dark:text-red-400 flex items-center gap-1">
                                    {{ errors.website[0] }}
                                </p>
                            </div>
                        </div>
                    </fieldset>

                    <fieldset
                        class="bg-white/70 dark:bg-gray-800/50 p-6 rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 transition-all duration-300 hover:shadow-xl">
                        <legend
                            class="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wide px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 rounded-full border border-emerald-200 dark:border-emerald-700 mb-4">
                            {{ t('customers.group_contact') }}
                        </legend>
                        <div class="space-y-4">
                            <transition-group name="fade" tag="div" class="space-y-4">
                                <div v-for="(contact, index) in formData.contacts" :key="index"
                                    class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-7 gap-4 bg-white dark:bg-gray-800/70 rounded-xl px-4 py-3 shadow-sm hover:shadow-md border border-gray-100 dark:border-gray-700 transition">
                                    <!-- Loại liên hệ -->
                                    <div class="col-span-1">
                                        <label
                                            class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                            {{ t('customers.fields.contact_type') }}
                                            <span v-if="!isViewMode" class="text-red-500 ml-1">*</span>
                                        </label>
                                        <SelectSearch v-model="contact.contact_type" :options="contactTypeOptions"
                                            size="sm" :disabled="isViewMode"
                                            :placeholder="t('customers.placeholders.contact_type')" :class="[
                                                'rounded-lg',
                                                'transition-all duration-200',
                                                'focus:outline-none',
                                                errors[`contacts.${index}.contact_type`]
                                                    ? 'ring-2 ring-red-300'
                                                    : 'hover:ring-2 hover:ring-indigo-500/30 focus:ring-2 focus:ring-indigo-500'
                                            ]" />

                                        <p v-if="errors[`contacts.${index}.contact_type`]"
                                            class="mt-1 text-xs text-red-500 dark:text-red-400 flex items-center gap-1">
                                            {{ errors[`contacts.${index}.contact_type`][0] }}
                                        </p>
                                    </div>

                                    <!-- Giá trị (phone/email) -->
                                    <div class="col-span-2">
                                        <label
                                            class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                            {{ t('customers.fields.contact_value') }}
                                            <span v-if="!isViewMode" class="text-red-500 ml-1">*</span>
                                        </label>
                                        <input type="text" v-model="contact.value" :readonly="isViewMode"
                                            :placeholder="t('customers.placeholders.contact_value')" :class="[
                                                'w-full text-xs px-3 py-2 rounded-lg border transition-colors',
                                                isViewMode
                                                    ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed text-gray-600 dark:text-gray-300'
                                                    : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:border-indigo-300',
                                                errors[`contacts.${index}.value`]
                                                    ? 'ring-2 ring-red-300'
                                                    : 'border-gray-300 dark:border-gray-600'
                                            ]" @blur="formatContactValue(contact)" autocomplete="off" />
                                        <p v-if="errors[`contacts.${index}.value`]"
                                            class="mt-1 text-xs text-red-500 dark:text-red-400 flex items-center gap-1">
                                            {{ errors[`contacts.${index}.value`][0] }}
                                        </p>
                                    </div>

                                    <!-- Nhãn liên hệ -->
                                    <div class="col-span-1">
                                        <label
                                            class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                            {{ t('customers.fields.contact_label') }}
                                        </label>
                                        <input type="text" v-model="contact.label" :readonly="isViewMode"
                                            :placeholder="t('customers.placeholders.contact_label')" :class="[
                                                'w-full text-xs px-3 py-2 rounded-lg border transition-colors',
                                                isViewMode
                                                    ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed text-gray-600 dark:text-gray-300'
                                                    : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:border-indigo-300',
                                                errors[`contacts.${index}.label`]
                                                    ? 'ring-2 ring-red-300'
                                                    : 'border-gray-300 dark:border-gray-600'
                                            ]" autocomplete="off" />
                                        <p v-if="errors[`contacts.${index}.label`]"
                                            class="mt-1 text-xs text-red-500 dark:text-red-400 flex items-center gap-1">
                                            {{ errors[`contacts.${index}.label`][0] }}
                                        </p>
                                    </div>

                                    <!-- Ghi chú -->
                                    <div class="col-span-1">
                                        <label
                                            class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                            {{ t('customers.fields.contact_note') }}
                                        </label>
                                        <input type="text" v-model="contact.note" :readonly="isViewMode"
                                            :placeholder="t('customers.placeholders.contact_note')" :class="[
                                                'w-full text-xs px-3 py-2 rounded-lg border transition-colors',
                                                isViewMode
                                                    ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed text-gray-600 dark:text-gray-300'
                                                    : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:border-indigo-300',
                                                errors[`contacts.${index}.note`]
                                                    ? 'ring-2 ring-red-300'
                                                    : 'border-gray-300 dark:border-gray-600'
                                            ]" autocomplete="off" />
                                        <p v-if="errors[`contacts.${index}.note`]"
                                            class="mt-1 text-xs text-red-500 dark:text-red-400 flex items-center gap-1">
                                            {{ errors[`contacts.${index}.note`][0] }}
                                        </p>
                                    </div>
                                    <!-- Liên hệ chính -->
                                    <div class="flex items-center">
                                        <label
                                            class="pl-4 flex items-center gap-1 text-xs font-semibold text-gray-700 dark:text-gray-300">
                                            <input type="checkbox" v-model="contact.is_primary" :disabled="isViewMode"
                                                class="accent-blue-500 rounded-md mr-2" />
                                            {{ t('customers.fields.is_primary') }}
                                        </label>
                                    </div>
                                    <!-- Xóa -->
                                    <div class="flex items-center justify-center pt-3 col-span-1" v-if="index !== 0">
                                        <button v-if="!isViewMode" type="button"
                                            class="rounded-full p-2 bg-red-100 dark:bg-red-900/40 text-red-600 hover:bg-red-200 dark:hover:bg-red-800/60 transition"
                                            title="Xóa liên hệ" @click="removeContact(index)">
                                            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2"
                                                viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round"
                                                    d="M6 18L18 6M6 6l12 12"></path>
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </transition-group>

                            <div class="pt-2">
                                <button v-if="!isViewMode" type="button" @click="addContact"
                                    class="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold rounded-lg shadow transition">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2"
                                        viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"></path>
                                    </svg>
                                    {{ t('customers.add_contact') }}
                                </button>
                            </div>
                        </div>
                    </fieldset>



                    <fieldset v-if="formData.customer_type === 'ORGANIZATION'"
                        class="bg-white/70 dark:bg-gray-800/50 p-6 rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 transition-all duration-300 hover:shadow-xl">
                        <legend
                            class="flex items-center gap-2 text-xs font-bold text-orange-700 dark:text-orange-300 uppercase tracking-wide px-3 py-1 bg-orange-50 dark:bg-orange-900/20 rounded-full border border-orange-200 dark:border-orange-700 mb-4">
                            {{ t('customers.group_representative') }}
                        </legend>
                        <div class="space-y-4">
                            <transition-group name="fade" tag="div" class="space-y-4">
                                <div v-for="(rep, index) in formData.representatives" :key="index"
                                    class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 bg-white dark:bg-gray-800/70 rounded-xl px-4 py-3 shadow-sm hover:shadow-md border border-gray-100 dark:border-gray-700 transition">
                                    <!-- Họ tên -->
                                    <div class="col-span-1 lg:col-span-2">
                                        <label
                                            class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                            {{ t('customers.fields.rep_full_name') }}
                                            <span v-if="!isViewMode" class="text-red-500 ml-1">*</span>
                                        </label>
                                        <input type="text" v-model="rep.full_name" :readonly="isViewMode"
                                            :placeholder="t('customers.placeholders.rep_full_name')" :class="[
                                                'w-full text-xs px-3 py-2 rounded-lg border transition-colors',
                                                isViewMode
                                                    ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed text-gray-600 dark:text-gray-300'
                                                    : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:border-indigo-300',
                                                errors[`representatives.${index}.full_name`]
                                                    ? 'ring-2 ring-red-300'
                                                    : 'border-gray-300 dark:border-gray-600'
                                            ]" autocomplete="off" />
                                        <p v-if="errors[`representatives.${index}.full_name`]"
                                            class="mt-1 text-xs text-red-500 dark:text-red-400 flex items-center gap-1">
                                            {{ errors[`representatives.${index}.full_name`][0] }}
                                        </p>
                                    </div>

                                    <!-- Chức vụ -->
                                    <div class="col-span-1">
                                        <label
                                            class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                            {{ t('customers.fields.rep_position') }}
                                        </label>
                                        <input type="text" v-model="rep.position" :readonly="isViewMode"
                                            :placeholder="t('customers.placeholders.rep_position')" :class="[
                                                'w-full text-xs px-3 py-2 rounded-lg border transition-colors',
                                                isViewMode
                                                    ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed text-gray-600 dark:text-gray-300'
                                                    : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:border-indigo-300',
                                                errors[`representatives.${index}.position`]
                                                    ? 'ring-2 ring-red-300'
                                                    : 'border-gray-300 dark:border-gray-600'
                                            ]" autocomplete="off" />
                                        <p v-if="errors[`representatives.${index}.position`]"
                                            class="mt-1 text-xs text-red-500 dark:text-red-400 flex items-center gap-1">
                                            {{ errors[`representatives.${index}.position`][0] }}
                                        </p>
                                    </div>

                                    <!-- Số điện thoại -->
                                    <div class="col-span-1">
                                        <label
                                            class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                            {{ t('customers.fields.rep_phone') }}
                                        </label>
                                        <input type="text" v-model="rep.phone" :readonly="isViewMode"
                                            :placeholder="t('customers.placeholders.rep_phone')" :class="[
                                                'w-full text-xs px-3 py-2 rounded-lg border transition-colors',
                                                isViewMode
                                                    ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed text-gray-600 dark:text-gray-300'
                                                    : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:border-indigo-300',
                                                errors[`representatives.${index}.phone`]
                                                    ? 'ring-2 ring-red-300'
                                                    : 'border-gray-300 dark:border-gray-600'
                                            ]" autocomplete="off" />
                                        <p v-if="errors[`representatives.${index}.phone`]"
                                            class="mt-1 text-xs text-red-500 dark:text-red-400 flex items-center gap-1">
                                            {{ errors[`representatives.${index}.phone`][0] }}
                                        </p>
                                    </div>

                                    <!-- Email -->
                                    <div class="col-span-1 lg:col-span-2">
                                        <label
                                            class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                            {{ t('customers.fields.rep_email') }}
                                        </label>
                                        <input type="text" v-model="rep.email" :readonly="isViewMode"
                                            :placeholder="t('customers.placeholders.rep_email')" :class="[
                                                'w-full text-xs px-3 py-2 rounded-lg border transition-colors',
                                                isViewMode
                                                    ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed text-gray-600 dark:text-gray-300'
                                                    : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:border-indigo-300',
                                                errors[`representatives.${index}.email`]
                                                    ? 'ring-2 ring-red-300'
                                                    : 'border-gray-300 dark:border-gray-600'
                                            ]" autocomplete="off" />
                                        <p v-if="errors[`representatives.${index}.email`]"
                                            class="mt-1 text-xs text-red-500 dark:text-red-400 flex items-center gap-1">
                                            {{ errors[`representatives.${index}.email`][0] }}
                                        </p>
                                    </div>

                                    <!-- Loại giấy tờ -->
                                    <div class="col-span-1 lg:col-span-2">
                                        <label
                                            class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                            {{ t('customers.fields.identity_type') }}
                                        </label>
                                        <SelectSearch v-model="rep.identity_type" :options="identityTypeOptions"
                                            size="sm" :disabled="isViewMode"
                                            :placeholder="t('customers.placeholders.identity_type')" :class="[
                                                'rounded-lg',
                                                'transition-all duration-200',
                                                'focus:outline-none',
                                                errors[`representatives.${index}.identity_type`]
                                                    ? 'ring-2 ring-red-300'
                                                    : 'hover:ring-2 hover:ring-indigo-500/30 focus:ring-2 focus:ring-indigo-500'
                                            ]" />
                                        <p v-if="errors[`representatives.${index}.identity_type`]"
                                            class="mt-1 text-xs text-red-500 dark:text-red-400 flex items-center gap-1">
                                            {{ errors[`representatives.${index}.identity_type`][0] }}
                                        </p>
                                    </div>

                                    <!-- Số giấy tờ -->
                                    <div class="col-span-1">
                                        <label
                                            class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                            {{ t('customers.fields.identity_number') }}
                                        </label>
                                        <input type="text" v-model="rep.identity_number" :readonly="isViewMode"
                                            :placeholder="t('customers.placeholders.identity_number')" :class="[
                                                'w-full text-xs px-3 py-2 rounded-lg border transition-colors',
                                                isViewMode
                                                    ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed text-gray-600 dark:text-gray-300'
                                                    : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:border-indigo-300',
                                                errors[`representatives.${index}.identity_number`]
                                                    ? 'ring-2 ring-red-300'
                                                    : 'border-gray-300 dark:border-gray-600'
                                            ]" autocomplete="off" />
                                        <p v-if="errors[`representatives.${index}.identity_number`]"
                                            class="mt-1 text-xs text-red-500 dark:text-red-400 flex items-center gap-1">
                                            {{ errors[`representatives.${index}.identity_number`][0] }}
                                        </p>
                                    </div>

                                    <!-- Ghi chú -->
                                    <div class="col-span-1 lg:col-span-2">
                                        <label
                                            class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                            {{ t('customers.fields.rep_note') }}
                                        </label>
                                        <input type="text" v-model="rep.note" :readonly="isViewMode"
                                            :placeholder="t('customers.placeholders.rep_note')" :class="[
                                                'w-full text-xs px-3 py-2 rounded-lg border transition-colors',
                                                isViewMode
                                                    ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed text-gray-600 dark:text-gray-300'
                                                    : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:border-indigo-300',
                                                errors[`representatives.${index}.note`]
                                                    ? 'ring-2 ring-red-300'
                                                    : 'border-gray-300 dark:border-gray-600'
                                            ]" autocomplete="off" />
                                        <p v-if="errors[`representatives.${index}.note`]"
                                            class="mt-1 text-xs text-red-500 dark:text-red-400 flex items-center gap-1">
                                            {{ errors[`representatives.${index}.note`][0] }}
                                        </p>
                                    </div>

                                    <!-- Xóa -->
                                    <div class="flex items-center justify-center pt-3">
                                        <button v-if="!isViewMode" type="button"
                                            class="rounded-full p-2 bg-red-100 dark:bg-red-900/40 text-red-600 hover:bg-red-200 dark:hover:bg-red-800/60 transition"
                                            title="Xóa đại diện" @click="removeRepresentative(index)">
                                            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2"
                                                viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round"
                                                    d="M6 18L18 6M6 6l12 12"></path>
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </transition-group>

                            <div class="pt-2">
                                <button v-if="!isViewMode" type="button" @click="addRepresentative"
                                    class="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold rounded-lg shadow transition">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2"
                                        viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"></path>
                                    </svg>
                                    {{ t('customers.add_representative') }}
                                </button>
                            </div>
                        </div>
                    </fieldset>
                    <fieldset class="bg-white/70 dark:bg-gray-800/60 p-4 rounded-xl shadow border mb-4">
                        <legend
                            class="font-bold text-indigo-600 dark:text-indigo-300 uppercase text-xs px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-700">
                            Đính kèm
                        </legend>
                        <!-- Upload + chọn loại giấy tờ -->
                        <div class="grid grid-cols-12 gap-3 items-end mt-1" v-if="!isViewMode">
                            <!-- File input -->
                            <div class="col-span-4 flex items-center gap-2">
                                <input type="file" @change="onFileChange"
                                    class="text-xs border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 min-w-0 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                    :disabled="isViewMode" />
                            </div>
                            <!-- Select loại giấy tờ -->
                            <div class="col-span-5">
                                <SelectSearch v-model="newFileType" :options="fileTypeOptions"
                                    :placeholder="$t('common.select')" :disabled="isViewMode" size="xs" :class="[
                                        'rounded-lg w-full',
                                        'transition-all duration-200',
                                        'focus:outline-none',
                                        errors.status
                                            ? 'ring-2 ring-red-300'
                                            : 'hover:ring-2 hover:ring-blue-500/30 focus:ring-2 focus:ring-blue-300'
                                    ]" />
                            </div>
                            <!-- Nút tải lên -->
                            <div class="col-span-3 flex">
                                <button type="button" @click="uploadFile"
                                    :disabled="!fileToUpload || !newFileType || isViewMode"
                                    class="bg-blue-600 hover:bg-blue-700 text-white text-xs px-5 py-2 rounded-lg font-semibold shadow-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 w-full">
                                    Tải lên
                                </button>
                            </div>
                        </div>
                        <!-- Danh sách file dạng bảng -->
                        <table
                            class="w-full mt-4 text-xs border rounded-full bg-white dark:bg-gray-800/70 border-gray-200 dark:border-gray-700">
                            <thead>
                                <tr class="bg-gray-50 dark:bg-gray-900/10">
                                    <th class="py-2 px-3 font-semibold text-left w-8">#</th>
                                    <th class="py-2 px-3 font-semibold text-left  w-2">Tên file</th>
                                    <th class="py-2 px-3 font-semibold text-left w-[150px]">Loại giấy tờ</th>
                                    <th class="py-2 px-3 font-semibold text-left w-24"></th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(file, idx) in fileList" :key="file.id" class="border-t">
                                    <td class="py-1 px-3 text-center">{{ idx + 1 }}</td>
                                    <td class="py-1 px-3">
                                        <a v-if="file.url" @click="previewFile(file)"
                                            class="text-blue-500 hover:underline font-medium">{{ file.original_name }}</a>
                                        <span v-else>{{ file.original_name }}</span>
                                    </td>
                                    <td class="py-1 px-3">
                                        <SelectSearch v-model="file.document_type" :options="fileTypeOptions" size="sm"
                                            :disabled="isViewMode" :placeholder="$t('common.select')"
                                            @change="updateFileType(file, $event)" :class="[
                                                'rounded-lg w-full',
                                                'transition-all duration-200',
                                                'focus:outline-none',
                                                errors.status
                                                    ? 'ring-2 ring-red-300'
                                                    : 'hover:ring-2 hover:ring-blue-500/30 focus:ring-2 focus:ring-blue-300'
                                            ]" />
                                    </td>
                                    <td class="py-1 px-3 text-right">
                                        <button type="button" v-if="!isViewMode" :disabled="isViewMode"
                                            class="text-red-500 hover:text-red-700 px-2 py-1 rounded font-semibold transition"
                                            @click="removeFile(file)">
                                            Xóa
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </fieldset>



                    <!-- Error Message -->
                    <!-- <div v-if="submitError" class="rounded-md bg-red-50 dark:bg-red-900/30 p-4 mt-6">
                    <div class="flex items-center">
                        <div class="ml-3">
                            <h3 class="font-medium text-red-800 dark:text-red-200">{{ t('common.submission_error') }}
                            </h3>
                            <p class="mt-1 text-red-700 dark:text-red-300">{{ submitError }}</p>
                        </div>
                    </div>
                </div> -->
                    <div class="flex justify-end space-x-3 mt-3">
                        <button type="button" @click="closeModal"
                            class="px-4 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600">
                            {{ isViewMode ? t('common.close') : t('common.cancel') }}
                        </button>
                        <button v-if="!isViewMode" type="submit" @click="handleSubmit" :disabled="hasErrors"
                            class="px-4 py-2 text-xs font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed">
                            {{ isEditMode ? t('common.update') : t('common.save') }}
                        </button>
                    </div>
                </form>
            </div>
            <div v-show="currentTab === 'logs' && formData.id != null" class="p-6">
                <CustomerLogTab :customerId="formData.id" :isActive="currentTab === 'logs'" />
            </div>
            <div v-show="currentTab === 'tracking' && formData.id != null" class="p-6">
                <TrackingTab :customerId="formData.id ?? undefined" :isActive="currentTab === 'tracking'"
                    @renew="onRenewPackage" @bulk-renew="onRenewPackage" :categorySystem="categorySystem" />
            </div>


        </template>
      

        <!-- Footer -->
        <!-- <template #footer>

        </template> -->
    </BaseModal>
      <ConfirmModal :show="showModalDelete" :close="closeModalConfirm" :onConfirm="confirmDelete" type="danger"
        :closeOnClickOutside="false" :title="t('common.confirm')" :message="t('common.confirm_delete')"
        :confirmText="t('common.yes')" :cancelText="t('common.no')" />
            <!-- <FilePreview v-if="previewItem !== null" :open="previewItem !== null" :file="previewItem"
      @close="previewItem = null" /> -->
</template>



<script setup lang="ts">
import { ref, computed, watch, inject } from 'vue'
import { useI18n } from 'vue-i18n'
import BaseModal from '@/components/modals/BaseModal.vue'
import SelectSearch from '@/components/forms/SelectSearch.vue'
import CustomerLogTab from '@/modules/customer/components/CustomerLogTab.vue'
import TrackingTab from '@/modules/customer/components/TrackingTab.vue'
import ConfirmModal from '@/components/modals/ConfirmModal.vue';
import FilePreview from '@/modules/filemanager/components/FilePreview.vue'
import config from "@/config/config";
import { api } from '@/utils/api'
import { notificationService } from '@/services/notification'
const setLoading = inject<(isLoading: boolean) => void>('setLoading')
const { t } = useI18n()

const props = defineProps({
    isModalOpen: Boolean,
    errors: {
        type: Object,
        default: () => ({})
    },
    mode: {
        type: String,
        default: 'add',
        validator: (value: string) => ['add', 'edit', 'view'].includes(value)
    },
    currentCustomer: {
        type: Object,
        default: () => ({})
    },
    categorySystem: {
        type: Object
    },
})
const showModalDelete = ref(false);
const closeModalConfirm = () => {
    showModalDelete.value = false
}
const previewItem = ref<File | null>(null);
const previewFile = (file:any) => {
    if (!file.id) return;
  window.open(config.api_be + `/file/${file.id}?download=0`, '_blank');
};
const statusOptions = ref<{ label: string; value: string }[]>([
    { value: 'new', label: t('customers.status.new') },
    { value: 'in_progress', label: t('customers.status.in_progress') },
    { value: 'converted', label: t('customers.status.converted') },
    { value: 'unqualified', label: t('customers.status.unqualified') },
    { value: 'inactive', label: t('customers.status.inactive') }
])

const fileTypeOptions = [
    { value: 'CCCD_FRONT', label: 'CCCD mắt trước' },
    { value: 'CCCD_BACK', label: 'CCCD mắt sau' },
    { value: 'CCCD_TWO', label: 'CCCD 2 Mặt' },
    { value: 'PP', label: 'Hộ chiếu' },
    { value: 'GPKD', label: 'Giấy phép kinh doanh' },
    { value: 'KHAC', label: 'Khác' },
]
const fileList = ref<UploadedFile[]>([]) // mảng lưu các file đã upload, gồm {id, name, url, document_type}
const fileToUpload = ref<File | null>(null) // file đang được chọn để upload
const newFileType = ref('')

const uploadFile = async () => {
    if (!fileToUpload.value || !newFileType.value) return
    const form = new FormData()
    try {
        setLoading?.(true)
        form.append('file', fileToUpload.value)
        form.append('document_type', newFileType.value)
        form.append('object_id', formData.value.id || '')
        const res = await api.post('/customers/files', form)
        if (formData.value.id) {
            await fetchFileList(); // Luôn đồng bộ lại list sau upload
        } else {
            // Nếu chưa có ID, chỉ cần thêm file mới vào danh sách
            fileList.value.push({
                id: res.data.data.id,
                name: res.data.data.name,
                original_name: res.data.data.original_name,
                url: res.data.data.url,
                document_type: newFileType.value
            })
        }
        fileToUpload.value = null
        newFileType.value = ''
    } catch (error: any) {
        console.error('Error uploading file:', error)
        notificationService.error(error.message || "Lỗi")
        return
    } finally {
        setLoading?.(false)
    }
}
const itemToDelete = ref<UploadedFile | null>(null) // item file đang được chọn để xóa
const removeFile = async (file: any) => {
    console.log(file);
    
    itemToDelete.value = file
    showModalDelete.value = true
}
const confirmDelete = async () => {
  if (!itemToDelete.value) return;
  try {
    setLoading?.(true);
    const endpoint = `/files/${itemToDelete.value.id}`;

    await api.delete(endpoint, {
      params: { id: itemToDelete.value.id }
    });
    fileList.value = fileList.value.filter(f => f.id !== itemToDelete.value?.id);
    itemToDelete.value = null; // Reset itemToDelete after deletion

    notificationService.success(t('file_manager.messages.delete_success'));
  } catch (error) {
    notificationService.error(t('file_manager.messages.delete_failed'));
  } finally {
    closeModalConfirm();
    setLoading?.(false);
  }
};



const provinceOptions = ref<{ label: string; value: string }[]>([])

const teamOptions = ref<{ label: string; value: string; userOptions: any }[]>([])

const userOptions = ref<{ label: string; value: string }[]>([])


const emit = defineEmits(['close', 'submit', 'renew-order'])
const onRenewPackage = (pkg: any) => {
    emit('renew-order', pkg)
}

// Tabs
const tabs = computed(() => {
    const arr = [
        { name: 'basic', label: t('customers.basic_info') },
    ];

    // Chỉ thêm tracking & logs nếu có formData.value.id
    if (formData.value.id) {
        arr.push(
            { name: 'tracking', label: t('customers.service_tracking') },
            { name: 'logs', label: t('customers.logs') }
        );
    }

    // Nếu cần representatives cho ORGANIZATION, giữ như cũ:
    // if (formData.value.customer_type === 'ORGANIZATION') {
    //     arr.push({ name: 'representatives', label: t('customers.representatives') })
    // }

    return arr;
});

const currentTab = ref('basic')

// Options
const customerTypeOptions = ref([
    { label: t('customers.types.individual'), value: 'INDIVIDUAL' },
    { label: t('customers.types.organization'), value: 'ORGANIZATION' }
])
// const genderOptions = ref([
//     { label: t('customers.gender_male'), value: 'male' },
//     { label: t('customers.gender_female'), value: 'female' },
//     { label: t('customers.gender_other'), value: 'other' }
// ])
const identityTypeOptions = ref([
    { label: t('customers.identity_types.cccd'), value: 'CCCD' },
    { label: t('customers.identity_types.cmnd'), value: 'CMND' },
    { label: t('customers.identity_types.pp'), value: 'PP' }
])
const contactTypeOptions = ref([
    { label: t('customers.contact_types.phone'), value: 'phone' },
    { label: t('customers.contact_types.email'), value: 'email' }
])
const loadTeamOptions = async () => {
    try {
        const response = await api.get('teams', {
            params: {
                page: 1,
                limit: 1000
            }
        })
        const data = await response.data.data.items

        teamOptions.value = data.map((item: any) => ({
            label: item.name,
            value: item.id,
            userOptions: item.users.map((user: any) => ({
                label: user.name,
                value: user.id
            }))
        }))
        // Nếu có team_id trong currentCustomer, chọn team tương ứng
        if (props.currentCustomer.team_id) {
            const team = teamOptions.value.find(t => t.value === props.currentCustomer.team_id)
            if (team) {
                formData.value.team_id = team.value
                userOptions.value = team.userOptions
            }
        } else {
            userOptions.value = []
        }
    } catch (error) {
        console.error('Error loading teams:', error)
    }
}
const loadProvinceOptions = async () => {
    try {
        const response = await api.get('vn-provinces')
        const data = await response.data.data

        provinceOptions.value = data.map((item: any) => ({
            label: String(item.name),
            value: String(item.code)
        }))
    } catch (error) {
        console.error('Error loading provinces:', error)
    }
}


interface CustomerContact {
    contact_type: string;
    value: string;
    label: string;
    is_primary: boolean;
    note: string;
}

interface CustomerRepresentative {
    full_name: string;
    position: string;
    phone: string;
    email: string;
    identity_type: string;
    identity_number: string;
    note: string;
}

interface CustomerForm {
    id: string | null;
    customer_code: string;
    customer_type: string;
    full_name: string;
    short_name: string;
    gender: string;
    date_of_birth: string;
    tax_code: string;
    industry: string;
    address: string;
    province_code: string;
    identity_type: string;
    identity_number: string;
    position: string;
    website: string;
    team_id: string;
    assigned_to: string;
    status: string;
    contacts: CustomerContact[];
    representatives: CustomerRepresentative[];
}
interface UploadedFile {
    id: string
    name: string
    original_name: string
    url?: string
    document_type: string
    [key: string]: any // nếu có thêm thuộc tính khác
}


const formData = ref<CustomerForm>({
    id: null,
    customer_code: '',
    customer_type: 'INDIVIDUAL',
    full_name: '',
    short_name: '',
    gender: '',
    date_of_birth: '',
    tax_code: '',
    industry: '',
    address: '',
    province_code: '',
    identity_type: '',
    identity_number: '',
    position: '',
    website: '',
    team_id: '',
    assigned_to: '',
    status: 'new',
    contacts: [{
        contact_type: '',
        value: '',
        label: '',
        is_primary: false,
        note: ''
    }],
    representatives: []
});


const isEditMode = computed(() => props.mode === 'edit')
const isViewMode = computed(() => props.mode === 'view')
const modalSize = computed(() => 'full')
const errors = ref<Record<string, any>>({})
const submitError = ref<string | null>(null)

const hasErrors = computed(() => {
    // Có thể bổ sung kiểm tra required field tuỳ chỉnh
    return !formData.value.customer_type
})

// Methods
const toggleStatus = () => {
    formData.value.status = formData.value.status === 'active' ? 'inactive' : 'active'
}

const addContact = () => {
    formData.value.contacts.push({
        contact_type: '',
        value: '',
        label: '',
        is_primary: false,
        note: ''
    })
}
const removeContact = (index: number) => {
    formData.value.contacts.splice(index, 1)
}
const addRepresentative = () => {
    formData.value.representatives.push({
        full_name: '',
        position: '',
        phone: '',
        email: '',
        identity_type: '',
        identity_number: '',
        note: ''
    })
}
const formatContactValue = (contact: CustomerContact) => {
    if (contact.contact_type === 'phone') {
        contact.value = contact.value.replace(/\D/g, '') // Chỉ giữ số
    } else if (contact.contact_type === 'email') {
        contact.value = contact.value.trim().toLowerCase() // Chuyển thành chữ thường
    }
}
const removeRepresentative = (index: number) => {
    formData.value.representatives.splice(index, 1)
}

const resetForm = () => {
    formData.value = {
        id: null,
        customer_code: '',
        customer_type: 'INDIVIDUAL',
        full_name: '',
        short_name: '',
        gender: '',
        date_of_birth: '',
        tax_code: '',
        industry: '',
        address: '',
        province_code: '',
        identity_type: '',
        identity_number: '',
        position: '',
        website: '',
        team_id: '',
        assigned_to: '',
        status: 'new',
        contacts: [{
            contact_type: '',
            value: '',
            label: '',
            is_primary: false,
            note: ''
        }],
        representatives: []
    }
    errors.value = {}
    submitError.value = null
    currentTab.value = 'basic'
    fileList.value = []
}

const closeModal = () => {
    resetForm()
    emit('close')
}


const validateForm = (): boolean => {
    let hasError = false
    errors.value = {}
    if (!formData.value.team_id) {
        errors.value.team_id = [t('common.required')]
        hasError = true
    }
    if (!formData.value.assigned_to) {
        errors.value.assigned_to = [t('common.required')]
        hasError = true
    }

    // validate required
    if (!formData.value.customer_type) {
        errors.value.customer_type = [t('common.required')]
        hasError = true
    }
    if (!formData.value.full_name) {
        errors.value.full_name = [t('common.required')]
        hasError = true
    }
    if (!formData.value.address) {
        errors.value.address = [t('common.required')]
        hasError = true
    }
    if (!formData.value.province_code) {
        errors.value.province_code = [t('common.required')]
        hasError = true
    }
    if (!formData.value.status) {
        errors.value.status = [t('common.required')]
        hasError = true
    }

    // Validate contact info
    if (formData.value.contacts.length === 0) {
        errors.value['contacts'] = [t('customers.validation.at_least_one_contact')]
        hasError = true
    } else {
        formData.value.contacts.forEach((c, idx) => {
            if (!c.contact_type) {
                errors.value[`contacts.${idx}.contact_type`] = [t('common.required')]
                hasError = true
            }
            if (!c.value) {
                errors.value[`contacts.${idx}.value`] = [t('common.required')]
                hasError = true
            } else if (c.contact_type === 'email') {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
                if (!emailRegex.test(c.value.trim())) {
                    errors.value[`contacts.${idx}.value`] = [t('common.invalid_email')]
                    hasError = true
                }
            } else if (c.contact_type === 'phone') {
                const phoneRegex = /^[0-9]{9,15}$/
                if (!phoneRegex.test(c.value.replace(/\D/g, ''))) {
                    errors.value[`contacts.${idx}.value`] = [t('common.invalid_phone')]
                    hasError = true
                }
            }
        })
    }

    // Validate organization representatives nếu là tổ chức
    if (formData.value.customer_type === 'ORGANIZATION') {
        if (formData.value.representatives.length === 0) {
            errors.value['representatives'] = [t('customers.validation.at_least_one_representative')]
            hasError = true
        } else {
            formData.value.representatives.forEach((rep, idx) => {
                if (!rep.full_name) {
                    errors.value[`representatives.${idx}.full_name`] = [t('common.required')]
                    hasError = true
                }
                if (rep.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rep.email.trim())) {
                    errors.value[`representatives.${idx}.email`] = [t('common.invalid_email')]
                    hasError = true
                }
                if (rep.phone && !/^[0-9]{9,15}$/.test(rep.phone.replace(/\D/g, ''))) {
                    errors.value[`representatives.${idx}.phone`] = [t('common.invalid_phone')]
                    hasError = true
                }
            })
        }
    }

    // Validate identity number nếu có
    if (formData.value.identity_number) {
        if (!/^[A-Za-z0-9]{6,20}$/.test(formData.value.identity_number)) {
            errors.value.identity_number = [t('customers.validation.invalid_identity_number')]
            hasError = true
        }
    }
    // Validate tax_code nếu có

    // if (!/^[0-9]{10}([0-9]{3})?$/.test(formData.value.tax_code)) {
    //     errors.value.tax_code = [t('customers.validation.invalid_tax_code')]
    //     hasError = true
    // }
    // Validate trùng liên hệ trong cùng khách hàng
    const seenContacts = new Set<string>();
    formData.value.contacts.forEach((c, idx) => {
        const key = `${c.contact_type}|${c.value.trim().toLowerCase()}`
        if (seenContacts.has(key)) {
            errors.value[`contacts.${idx}.value`] = [t('customers.validation.duplicate_contact')]
            hasError = true
        } else {
            seenContacts.add(key)
        }
    })
    if (formData.value.contacts.length > 10) {
        errors.value['contacts'] = [t('customers.validation.max_contacts')]
        hasError = true
    }
    formData.value.contacts.forEach((c, idx) => {
        if (formData.value.customer_type === 'ORGANIZATION' && !c.label) {
            errors.value[`contacts.${idx}.label`] = [t('customers.validation.label_required_for_org')]
            hasError = true
        }
    })
    if (formData.value.contacts.length > 10) {
        errors.value['contacts'] = [t('customers.validation.max_contacts', { count: 10 })]
        hasError = true
    }
    formData.value.contacts.forEach((c, idx) => {
        if (c.contact_type === 'email') {
            // Email regex + không cho phép chỉ số
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(c.value.trim())) {
                errors.value[`contacts.${idx}.value`] = [t('common.invalid_email')];
                hasError = true;
            }
            if (/^[0-9]{8,}$/.test(c.value.trim())) {
                errors.value[`contacts.${idx}.value`] = [t('customers.validation.not_phone_in_email')];
                hasError = true;
            }
        } else if (c.contact_type === 'phone') {
            // Số điện thoại regex + không chứa ký tự @
            const phoneRegex = /^[0-9]{9,15}$/;
            if (!phoneRegex.test(c.value.replace(/\D/g, ''))) {
                errors.value[`contacts.${idx}.value`] = [t('common.invalid_phone')];
                hasError = true;
            }
            if (/@/.test(c.value.trim())) {
                errors.value[`contacts.${idx}.value`] = [t('customers.validation.not_email_in_phone')];
                hasError = true;
            }
        }
    });
    if (formData.value.customer_type === 'ORGANIZATION') {
        // const repContacts = new Set(
        //     formData.value.representatives.flatMap(rep => [rep.phone, rep.email].filter(Boolean).map(x => x.trim().toLowerCase()))
        // );
        // formData.value.contacts.forEach((c, idx) => {
        //     if (repContacts.has(c.value.trim().toLowerCase())) {
        //         errors.value[`contacts.${idx}.value`] = [t('customers.validation.duplicate_with_representative')];
        //         hasError = true;
        //     }
        // });
    }
    // Cá nhân phải có số giấy tờ tùy thân (identity_number)
    if (formData.value.customer_type === 'INDIVIDUAL') {
        if (!formData.value.identity_type) {
            errors.value.identity_type = [t('common.required')]
            hasError = true
        }
        if (!formData.value.identity_number) {
            errors.value.identity_number = [t('common.required')]
            hasError = true
        } else if (!/^[A-Za-z0-9]{6,20}$/.test(formData.value.identity_number)) {
            errors.value.identity_number = [t('customers.validation.invalid_identity_number')]
            hasError = true
        }
    }

    // Tổ chức phải có mã số thuế
    if (formData.value.customer_type === 'ORGANIZATION') {
        const rawTaxCode = formData.value.tax_code || ''
        // Loại bỏ dấu gạch ngang (nếu có)
        const cleanedTaxCode = rawTaxCode.replace(/-/g, '')
        if (!formData.value.tax_code) {
            errors.value.tax_code = [t('common.required')]
            hasError = true
        } else if (!/^[0-9]{10,13}$/.test(cleanedTaxCode)) {
            errors.value.tax_code = [t('customers.validation.invalid_tax_code')]
            hasError = true
        }
        // Đại diện tổ chức cũng nên có số giấy tờ
        formData.value.representatives.forEach((rep, idx) => {
            if (!rep.identity_type) {
                errors.value[`representatives.${idx}.identity_type`] = [t('common.required')]
                hasError = true
            }
            if (!rep.identity_number) {
                errors.value[`representatives.${idx}.identity_number`] = [t('common.required')]
                hasError = true
            } else if (!/^[A-Za-z0-9]{6,20}$/.test(rep.identity_number)) {
                errors.value[`representatives.${idx}.identity_number`] = [t('customers.validation.invalid_identity_number')]
                hasError = true
            }
            if (!rep.position)
                if (!rep.position) {
                    errors.value[`representatives.${idx}.position`] = [t('common.required')];
                    hasError = true;
                } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rep.email.trim())) {
                    errors.value[`representatives.${idx}.email`] = [t('common.invalid_email')];
                    hasError = true;
                }
            if (!rep.phone) {
                errors.value[`representatives.${idx}.phone`] = [t('common.required')];
                hasError = true;
            } else if (!/^[0-9]{9,15}$/.test(rep.phone.replace(/\D/g, ''))) {
                errors.value[`representatives.${idx}.phone`] = [t('common.invalid_phone')];
                hasError = true;
            }
            if (!rep.email && !rep.email.trim()) {
                errors.value[`representatives.${idx}.email`] = [t('common.required')]
                hasError = true
            } else if (rep.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rep.email.trim())) {
                errors.value[`representatives.${idx}.email`] = [t('common.invalid_email')]
                hasError = true
            }
        });
    }


    return !hasError
}

const handleSubmit = () => {
    if (!validateForm()) return
    if (hasErrors.value) return
    try {
        emit('submit', {
            ...formData.value,
            customer_code: formData.value.customer_code.trim(),
            full_name: formData.value.full_name.trim(),
            short_name: formData.value.short_name.trim(),
            contacts: formData.value.contacts.map(c => ({ ...c, value: c.value.trim() })),
            representatives: formData.value.representatives.map(r => ({
                ...r, full_name: r.full_name.trim(),
                files: fileList.value.map(f => ({ id: f.id, document_type: f.document_type }))
            })),
            files: fileList.value.map(f => ({
                id: f.id,
                document_type: f.document_type
            }))
        })
    } catch (error: any) {
        submitError.value = error.message || t('common.submission_error')
    }
}

// Watchers
watch(() => formData.value.team_id, () => {
    userOptions.value = teamOptions.value.find(team => team.value === formData.value.team_id)?.userOptions || []
})
watch(() => formData.value.customer_type, () => {
    if (formData.value.customer_type === 'ORGANIZATION') {

        if (errors.value.identity_type) {
            errors.value.identity_type = ''
        }
        if (errors.value.identity_number) {
            errors.value.identity_number = ''
        }
    } else {
        if (errors.value.tax_code) {
            errors.value.tax_code = ''
        }
    }
})
watch(() => props.errors, (newErrors) => {
    errors.value = newErrors
}, { deep: true })

watch(() => props.currentCustomer, (customer) => {
    loadProvinceOptions()
    loadTeamOptions()
    if (!props.mode || props.mode === 'add') {
        resetForm()
        return
    }
    if (customer && (isViewMode.value || isEditMode.value)) {
        formData.value = {
            id: customer.id,
            customer_code: customer.customer_code || '',
            customer_type: customer.customer_type || 'INDIVIDUAL',
            full_name: customer.full_name || '',
            short_name: customer.short_name || '',
            gender: customer.gender || '',
            date_of_birth: customer.date_of_birth || '',
            tax_code: customer.tax_code || '',
            industry: customer.industry || '',
            address: customer.address || '',
            province_code: customer.province_code || '',
            identity_type: customer.identity_type || '',
            identity_number: customer.identity_number || '',
            position: customer.position || '',
            website: customer.website || '',
            team_id: customer.team_id || '',
            assigned_to: customer.assigned_to || '',
            status: customer.status || 'new',
            contacts: customer.contacts.length > 0 ? [...customer.contacts] : [
                {
                    contact_type: '',
                    value: '',
                    label: '',
                    is_primary: false,
                    note: ''
                }
            ],
            representatives: customer.representatives.length > 0 ? [...customer.representatives] : []
        }

        fetchFileList();
    }
}, { immediate: true })
const fetchFileList = async () => {
    if (formData.value.id) {
        const res = await api.get(`/getListByObjectId/${formData.value.id}`)
        fileList.value = res.data.data
    }
}
const updateFileType = async (
  file: { id: any; document_type: any },
  $event?: any
) => {
  try {
    setLoading?.(true);

    // Nếu $event truyền vào (giá trị mới), cập nhật vào file.document_type trước khi gửi API
    if ($event !== undefined) {
      file.document_type = $event;
    }

    console.log('Updating file type:', file);

    await api.put(`/files/${file.id}`, {
      document_type: file.document_type,
    });

    notificationService.success('Cập nhật loại giấy tờ thành công');
  } catch (error) {
    console.error('Error updating file type:', error);
    notificationService.error('Lỗi cập nhật loại giấy tờ');
  } finally {
    setLoading?.(false);
  }
};

const onFileChange = (event: Event) => {
    const input = event.target as HTMLInputElement
    if (input.files && input.files.length > 0) {
        fileToUpload.value = input.files[0]
    } else {
        fileToUpload.value = null
    }
}

</script>
