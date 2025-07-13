<template>
    <div class="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <!-- Header: Show entries, Tìm kiếm và các nút tác vụ -->
        <div
            class="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border-b border-gray-200 dark:border-gray-700 gap-3">
            <div class="flex flex-wrap items-center gap-3">
                <!-- Bulk actions -->
                <div v-if="hasSelection && selectedRows.length > 0 && bulkActions.length > 0" class="flex items-center gap-2">
                    <span class="text-xs text-gray-600 dark:text-gray-400">
                        {{ $t('selected_count', { count: selectedRows.length }) }}
                    </span>
                    <div class="relative" v-if="bulkActions.length > 0">
                        <button @click="showBulkActions = !showBulkActions"
                            class="flex items-center gap-1 px-3 py-1.5 text-xs rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                            <span>{{ $t('bulk_actions') }}</span>
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                            </svg>
                        </button>
                        <div @mouseleave="showBulkActions = false" v-if="showBulkActions" class="absolute z-10 mt-1 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                            <div class="py-1">
                                <button v-for="action in bulkActions" :key="action.name" @click="handleBulkAction(action)"
                                    class="block w-full text-left px-4 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                                    {{ $t(action.name) }}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                        <!-- Column visibility toggle -->
                    <div class="relative">
                    <button @click="showColumnMenu = !showColumnMenu"
                        class="flex items-center gap-1 px-3 py-1.5 text-xs rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                        <span>{{ $t('columns') }}</span>
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                        </svg>
                    </button>
                    <div @mouseleave="showColumnMenu = false" v-if="showColumnMenu" class="absolute z-10 mt-1 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                        <div class="py-1">
                            <div v-for="column in allColumns" :key="column.field" class="px-4 py-2 text-xs flex items-center">
                                <input type="checkbox" :id="`col-${column.field}`" v-model="column.visible" 
                                    class="rounded text-blue-500 focus:ring-blue-500 mr-2">
                                <label :for="`col-${column.field}`" class="text-gray-700 dark:text-gray-300 cursor-pointer">
                                    {{ $t(column.label) }}
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="flex items-center gap-3">
                <!-- Search -->
                <!-- <div class="relative w-full sm:w-64">
                    <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 dark:text-gray-500">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                        </svg>
                    </span>
                    <input v-model="searchQuery" @input="filterData" type="text" :placeholder="$t('search')"
                        class="w-full pl-10 pr-4 py-2 text-xs rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div> -->
                <!-- Phần tìm kiếm - thay thế phần search hiện tại -->
                <div class="relative w-full sm:w-200">
                    <div class="flex rounded-md shadow-sm">
                        <!-- Dropdown chọn field search -->
                        <button v-if="searchOptions.length > 1" @click="showSearchFields = !showSearchFields"
                            class="px-3 py-2 text-xs rounded-l-md border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600">
                            {{ getSearchFieldLabel(selectedSearchField) }}
                            <svg class="w-4 h-4 inline ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                            </svg>
                        </button>
                        
                        <!-- Dropdown menu cho search fields -->
                        <div @mouseleave="showSearchFields = false" v-if="showSearchFields" class=" w-max absolute z-20 mt-10 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                            <div class="py-1">
                                <button v-for="option in searchOptions" :key="option.field" 
                                    @click="selectedSearchField = option.field; showSearchFields = false"
                                    class="block w-full  text-left px-4 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                                    {{ option.label }}
                                </button>
                            </div>
                        </div>
                        
                        <!-- Input tìm kiếm -->
                        <div class="relative flex-grow">
                            <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 dark:text-gray-500">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                                </svg>
                            </span>
                            <input v-model="searchQuery" @change="filterData" type="text" :placeholder="$t('search')"
                                class="w-full pl-10 pr-4 py-2 text-xs border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                :class="{ 'rounded-l-md': searchOptions.length <= 1, 'rounded-r-md': (filterOptions.length <= 1 || !showRefreshButton), 'rounded-r-none' : showRefreshButton ||  filterOptions.length > 0}" />
                        </div>
                        
                        <!-- Nút filter -->
                        <button  @click="showFilters = !showFilters"
                            v-if="filterOptions.length > 0"
                            :class="{'rounded-r-none': showRefreshButton}"
                            class="px-3 py-2 text-xs rounded-r-md border border-l-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path>
                            </svg>
                        </button>
                        <button @click="$emit('refresh')"
                            v-if="showRefreshButton"
                            class="px-3 py-2 text-xs rounded-r-md border border-l-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                            :title="$t('common.refresh')">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                            </svg>
                        </button>
                    </div>
                </div>

            <!-- Filter Panel -->
            <div 
                v-if="showFilters && filterOptions.length > 0" 
                class="absolute z-99999 top-10 mt-1 w-full sm:w-96 right-10 rounded-lg shadow-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4"
            >
               <div class="flex justify-end">
                    <button @click="showFilters = false" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-xs">
                        ✕
                    </button>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div 
                        v-for="filter in filterOptions" 
                        :key="filter.field" 
                        :class="['col-span-1', {
                            'sm:col-span-2': filter.type === 'date-range' || filter.type === 'number-range'
                        }]"
                    >
                        <label class="block text-xs font text-gray-700 dark:text-gray-300 mb-2">
                            {{ t(filter.label) }}
                            <span v-if="filter.required" class="text-red-500">*</span>
                        </label>
                        <SelectSearch
                            v-if="filter.type === 'select'" 
                             v-model="activeFilters[filter.field]"
                             :modelValue="activeFilters[filter.field] || null"
                            :options="filter.options"
                            :placeholder="$t('common.select')"
                            :search-placeholder="$t('common.search')"
                            clearable
                        />
                        <!-- Select filter -->
                        <!-- <select 
                            v-if="filter.type === 'select'" 
                            v-model="activeFilters[filter.field]"
                            class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs py-2 px-3"
                        >
                            <option value="" selected>{{ $t('common.all') }}</option>
                            <option v-for="option in filter.options" :key="option.value" :value="option.value">
                                {{ t(option.label) }}
                            </option>
                        </select> -->
                        
                        <!-- Single Date filter -->
                        <flat-pickr 
                            v-else-if="filter.type === 'date'" 
                            v-model="activeFilters[filter.field]"
                            :config="{
                                dateFormat: 'Y-m-d',
                                altInput: true,
                                altFormat: 'F j, Y',
                                maxDate: filter.maxDate || null,
                                minDate: filter.minDate || null
                            }"
                            class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs py-2 px-3"
                        />
                        
                        <!-- Date Range filter -->
                        <div v-else-if="filter.type === 'date-range'" class="grid grid-cols-2 gap-2 items-center">
                        <flat-pickr 
                            v-model="activeFilters[filter.field].from"
                            :config="getDatePickerConfig(filter, 'from')"
                            @on-change="() => validateDateRange(filter.field)"
                            class="w-full col-span-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs py-2 px-3"
                            placeholder='dd/mm/yyyy'
                        />
                        <flat-pickr 
                            v-model="activeFilters[filter.field].to"
                            :config="getDatePickerConfig(filter, 'to')"
                            @on-change="() => validateDateRange(filter.field)"
                            class="w-full col-span-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs py-2 px-3"
                            placeholder='dd/mm/yyyy'
                        />
                        <p v-if="dateRangeErrors[filter.field]" class="col-span-2 text-xs text-red-500 mt-1">
                            {{ dateRangeErrors[filter.field] }}
                        </p>
                        </div>
                                                
                        <!-- Checkbox filter -->
                        <div v-else-if="filter.type === 'checkbox'" class="flex items-center">
                            <input 
                                v-model="activeFilters[filter.field]" 
                                type="checkbox"
                                class="h-4 w-4 rounded text-blue-500 focus:ring-blue-500 border-gray-300 dark:border-gray-600"
                            >
                            <label class="ml-2 text-xs text-gray-700 dark:text-gray-300">{{ $t('common.enabled') }}</label>
                        </div>
                        
                        <!-- Text input filter -->
                        <input 
                            v-else-if="filter.type === 'text'" 
                            v-model="activeFilters[filter.field]" 
                            type="text"
                            :placeholder="filter.placeholder || ''"
                            class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs py-2 px-3"
                        >
                        
                        <!-- Number range filter - Improved version -->
                        <div v-else-if="filter.type === 'number-range'" class="space-y-2">
                            <div class="flex items-center">
                                <label class="text-xs text-gray-500 dark:text-gray-400 w-16">{{ $t('common.min') }}:</label>
                                <input 
                                    v-model.number="activeFilters[filter.field].min" 
                                    type="number"
                                    :placeholder="filter.minPlaceholder || $t('common.min')"
                                    :min="filter.minLimit"
                                    :max="filter.maxLimit"
                                    class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs py-2 px-3"
                                    @input="validateNumberRange(filter.field)"
                                >
                            </div>
                            <div class="flex items-center">
                                <label class="text-xs text-gray-500 dark:text-gray-400 w-16">{{ $t('common.max') }}:</label>
                                <input 
                                    v-model.number="activeFilters[filter.field].max" 
                                    type="number"
                                    :placeholder="filter.maxPlaceholder || $t('common.max')"
                                    :min="filter.minLimit"
                                    :max="filter.maxLimit"
                                    class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs py-2 px-3"
                                    @input="validateNumberRange(filter.field)"
                                >
                            </div>
                            <p v-if="numberRangeErrors[filter.field]" class="text-xs text-red-500 mt-1">
                                {{ numberRangeErrors[filter.field] }}
                            </p>
                        </div>
                    </div>
                </div>
                
                <div class="flex justify-between items-center mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <button 
                        @click="resetFilters" 
                        class="px-4 py-2 text-xs rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                        {{ $t('common.reset') }}
                    </button>
                    <!-- <div class="text-xs text-gray-500 dark:text-gray-400" v-if="activeFilterCount > 0">
                        {{ activeFilterCount }} {{ $t('common.filters_active') }}
                    </div> -->
                    <button 
                        @click="applyFilters" 
                        :disabled="hasErrors"
                        class="px-4 py-2 text-xs rounded-lg bg-blue-500 text-white hover:bg-blue-600 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
                    >
                        {{ $t('common.apply') }}
                    </button>
                </div>
            </div>

                <!-- Add button and other actions -->
                <button v-if="showAddButton" @click="emit('add')"
                    class="flex items-center gap-1 px-3 py-2 text-xs rounded-md bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                    </svg>
                    <span>{{ $t('add') }}</span>
                </button>

                <!-- Export button -->
                <button v-if="showExport" @click="exportData"
                    class="flex items-center gap-1 px-3 py-2 text-xs rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                    </svg>
                    <span>{{ $t('export') }}</span>
                </button>
            </div>
        </div>

        <!-- Bảng -->
        <div class="max-w-full overflow-x-auto custom-scrollbar table-scroll-container">
            <table class="min-w-full text-xs">
                <thead class="sticky top-0 bg-white dark:bg-gray-800 z-9">
                    <!-- Header row -->
                <tr class="border-b border-gray-200 dark:border-gray-700">
                    <!-- Checkbox column -->    
                    <th v-if="hasSelection" class="px-4 py-3 w-10">
                        <input type="checkbox" v-model="selectAll" 
                            class="rounded text-blue-500 focus:ring-blue-500 border-gray-300 dark:border-gray-600">
                    </th>
                    
                    <!-- Data columns -->
                    <th
                        v-for="column in visibleColumns"
                        :key="column.field"
                        draggable="true"
                        @dragstart="dragStart($event, column)"
                        @dragover.prevent
                        @drop="drop($event, column)"
                        @click="sort(column.field, column.sortable)"
                        :class="[
                            'px-5 py-3 cursor-pointer select-none sm:px-6',
                            // class căn lề header
                            column.headerAlign === 'center' ? 'text-center' :
                            column.headerAlign === 'right' ? 'text-right' : 'text-left',
                            // class sort đang active
                            { 'bg-gray-50 dark:bg-gray-700': sortKey === column.field }
                        ]"
                        >
                        <div class="flex items-center justify-between">
                            <p class="text-gray-500 text-xs tracking-wider dark:text-gray-400 flex items-center gap-1">
                            {{ $t(column.label) }}
                            <span v-if="sortKey === column.field" class="ml-1">
                                {{ sortOrder === 'asc' ? '↑' : '↓' }}
                            </span>
                            </p>
                            <button
                            v-if="column.filterable"
                            @click.stop="toggleColumnFilter(column)"
                            class="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                            >
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                                ></path>
                            </svg>
                            </button>
                        </div>
                    </th>
                    <!-- Action column -->
                    <th v-if="hasActions" class="px-5 py-3 text-left cursor-pointer select-none sm:px-6 w-24">
                        <p class="text-gray-500 text-xs tracking-wider dark:text-gray-400">
                            {{ $t('action') }}
                        </p>
                    </th>
                </tr>

                <!-- Filter row - hiển thị khi có ít nhất một filter active -->
                <tr v-if="hasActiveFilters" class="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                    <!-- Ô trống cho checkbox column nếu có -->
                    <th v-if="hasSelection" class="px-4 py-2"></th>
                    
                    <!-- Các ô filter tương ứng với từng cột -->
                    <th v-for="column in visibleColumns" :key="'filter-'+column.field" class="px-5 py-2 sm:px-6">
                        <div v-if="column.filterActive">
                            <input v-model="column.filterValue" @input="applyColumnFilter(column)"
                                type="text" :placeholder="$t('filter')"
                                class="font-medium w-full px-2 py-1 text-theme-xs bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"/>
                        </div>
                    </th>
                    
                    <!-- Ô trống cho action column nếu có -->
                    <th v-if="hasActions" class="px-5 py-2 sm:px-6"></th>
                </tr>
                </thead>
                
                <tbody>
                    <tr v-for="row in paginatedData" :key="row.id"
                        class="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-white/[0.05]"
                        :class="{ 'bg-blue-50 dark:bg-blue-900/20': isRowSelected(row) }">
                        <!-- Row selection checkbox -->
                        <td v-if="hasSelection" class="px-4 py-3">
                            <input type="checkbox" :checked="isRowSelected(row)" @change="toggleRowSelection(row)"
                                class="rounded text-blue-500 focus:ring-blue-500 border-gray-300 dark:border-gray-600">
                        </td>
                        
                        <!-- Data cells -->
                        <td v-for="column in visibleColumns" :key="column.field" class="px-5 py-3 sm:px-6"
                        
                            :class="[
                                column.align === 'center' ? 'text-center' :
                                column.align === 'right' ? 'text-right' : 'text-left',
                                column.isHtml ? 'whitespace-normal' : 'whitespace-nowrap'
                            ]">
                            <slot :name="`cell-${column.field}`" :row="row" :value="row[column.field]">
                                <input
                                    v-if="editingCell === `${row.id}-${column.field}`"
                                    v-model="row[column.field]"
                                    @blur="saveEdit(row)"
                                    @keydown.enter="saveEdit(row)"
                                    class="font-medium w-full px-2 py-1 text-theme-xs bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                                />
                                <span
                                    v-else
                                    @click="startEdit(row.id, column.field, column.editingCell)"
                                    class="cursor-pointer font-medium text-theme-xs"
                                    :class="getCellClass(row[column.field], column)"
                                >
                                    <span v-if="column.isHtml" v-html="formatCellValue(row[column.field], column, row)"></span>
                                    <span v-else>{{ formatCellValue(row[column.field], column, row) }}</span>
                                </span>
                            </slot>
                        </td>
                        
                        <!-- Action cells -->
                        <td v-if="hasActions" class="px-5 py-3 sm:px-6 relative">
                        <!-- Nút ba chấm -->
                        <button @click.stop="toggleActionMenu(row.id, $event)"
                            class="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600">
                            <svg class="w-4 h-4 text-gray-500 dark:text-gray-300" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                            fill="currentColor" viewBox="0 0 4 15">
                            <path
                                d="M3.5 1.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 6.041a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 5.959a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
                            </svg>
                        </button>
                        <Teleport to="body">
                        <!-- Dropdown menu -->
                        <div v-if="activeActionMenu === row.id"   @mouseleave="activeActionMenu = null"
                            :style="dropdownPositionStyle"
                             class="fixed w-max rounded-md right-200 shadow-lg bg-white dark:bg-gray-700">
                            <div class="py-1">
                            <button v-for="(action, index) in filteredActions(row)" :key="index"
                                @click="() => { action.handler(row); closeActionMenu(); }"
                                class="flex items-center w-full px-4 py-2 text-xs text-left hover:bg-gray-100 dark:hover:bg-gray-600"
                                :class="action.class" :title="action.tooltip">
                                <component :is="action.icon" class="w-4 h-4 mr-2" />
                                {{ t(action.tooltip) }}
                            </button>
                            </div>
                        </div>
                        </Teleport>
                        </td>

                    </tr>
                    
                    <!-- Empty state -->
                    <tr v-if="filteredData.length === 0">
                        <td :colspan="totalColumns" class="px-5 py-10 text-center text-gray-500 dark:text-gray-400">
                            <div class="flex flex-col items-center justify-center gap-2">
                                <svg class="w-10 h-10 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                                <p class="text-xs">{{ $t('no_data') }}</p>
                                <!-- <button v-if="showAddButton" @click="emit('add')"
                                    class="mt-2 px-3 py-1.5 text-xs rounded-md bg-blue-500 text-white hover:bg-blue-600">
                                    {{ $t('add_first_item') }}
                                </button> -->
                            </div>
                        </td>
                    </tr>
                </tbody>
                <tfoot>
                    <tr><td colspan="100%">
                    <!-- Phân trang -->
                    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700 text-xs gap-3">
                    <!-- Show entries -->
                    <div class="flex items-center gap-2">
                        <span class="text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">{{ $t('show') }}</span>
                        <div class="relative">
                            <select v-model="pageSize"
                                class="pl-3 pr-8 py-1.5 text-xs rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer transition-colors duration-200">
                                <option v-for="size in pageSizeOptions" :value="size" :key="size">{{ size }}</option>
                            </select>
                        </div>
                        <span class="text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">{{ $t('entries') }}</span>
                    </div>
                    <!-- Pagination controls -->
                    <div class="flex items-center gap-1">
                        <button 
                            :disabled="currentPage === 1" 
                            @click="currentPage--"
                            class="px-3 py-1.5 rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center min-w-[2.5rem]"
                            aria-label="Previous page"
                            >
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" class="text-gray-600 dark:text-gray-300"></path>
                            </svg>
                        </button>
                        <!-- First page -->
                        <button 
                            v-if="currentPage > 3 && totalPages > 5" 
                            @click="currentPage = 1"
                            class="px-3 py-1.5 rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 flex items-center justify-center min-w-[2.5rem] text-gray-700 dark:text-gray-200"
                            aria-label="Go to first page"
                            >
                        1
                        </button>
                        <span v-if="currentPage > 3 && totalPages > 5" class="px-2 py-1 text-gray-500 dark:text-gray-400 flex items-center">...</span>
                        <!-- Page numbers -->
                        <button 
                            v-for="page in displayedPages" 
                            :key="page" 
                            @click="currentPage = page"
                            class="px-3 py-1.5 rounded-md min-w-[2.5rem] flex items-center justify-center transition-colors duration-200 text-gray-700 dark:text-gray-200"
                            :class="currentPage === page
                            ? 'bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700'
                            : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'"
                            :aria-label="`Go to page ${page}`"
                            :aria-current="currentPage === page ? 'page' : null"
                            >
                        {{ page }}
                        </button>
                        <!-- Last page -->
                        <span v-if="currentPage < totalPages - 2 && totalPages > 5" class="px-2 py-1 text-gray-500 dark:text-gray-400 flex items-center">...</span>
                        <button 
                            v-if="currentPage < totalPages - 1 && totalPages > 5" 
                            @click="currentPage = totalPages"
                            class="px-3 py-1.5 rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 flex items-center justify-center min-w-[2.5rem] text-gray-700 dark:text-gray-200"
                            aria-label="Go to last page"
                            >
                        {{ totalPages }}
                        </button>
                        <!-- Go to page input -->
                        <div v-if="totalPages > 10" class="flex items-center ml-2 gap-2">
                            <span class="text-xs text-gray-600 dark:text-gray-300 whitespace-nowrap">{{ $t('go_to') }}</span>
                            <input 
                                v-model.number="goToPage" 
                                @keyup.enter="goToSpecificPage" 
                                type="number" 
                                min="1" 
                                :max="totalPages"
                                class="w-16 px-2 py-1.5 text-xs rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 transition-colors duration-200"
                                aria-label="Page number input"
                                >
                        </div>
                        <button 
                            :disabled="currentPage === totalPages" 
                            @click="currentPage++"
                            class="px-3 py-1.5 rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center min-w-[2.5rem]"
                            aria-label="Next page"
                            >
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" class="text-gray-600 dark:text-gray-300"></path>
                            </svg>
                        </button>
                    </div>
                    <!-- Showing info -->
                    <div class="flex items-center gap-4">
                        <span class="text-gray-600 dark:text-gray-400 whitespace-nowrap">
                            {{ $t('showing', {
                                start: (currentPage - 1) * pageSize + 1, 
                                end: Math.min(currentPage * pageSize, totalItems), 
                                total: totalItems 
                            }) }}
                        </span>
                    </div>
                    </div>
                    </td></tr>
                </tfoot>
            </table>
        </div>
    </div>
    <ConfirmModal :show="showRequireConfirmModal" :close="closeBulkModal" :onConfirm="confirmBulkModal" type="danger"
            :closeOnClickOutside="false" :title="t('common.confirm')" :message="confirmMessage"
            :confirmText="t('common.yes')" :cancelText="t('common.no')" />
    <InputModal
        :show="showInputModal"
        :close="() => showInputModal = false"
        :onConfirm="handleInputConfirm"
        :title="titleModal"
        :message="confirmMessage"
        :inputLabel="labelInputModal"
        :inputPlaceholder="placeholderInputModal"
        inputRequired
        :inputValidator="inputValidator"
    />
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import flatPickr from 'vue-flatpickr-component'
import 'flatpickr/dist/flatpickr.css'
import SelectSearch from '@/components/forms/SelectSearch.vue'
import { useCategorySystem } from '@/stores/categorySystem'
import ConfirmModal from '@/components/modals/ConfirmModal.vue'
import InputModal from '@/components/modals/InputModal.vue'
const categorySystem = useCategorySystem()
import { Vietnamese } from 'flatpickr/dist/l10n/vn.js'

const { t } = useI18n();

const props = defineProps({
    columns: { 
        type: Array, 
        required: true,
        default: () => [],
        validator: (cols) => cols.every(c => typeof c.field === 'string')
    },
    rowData: { 
        type: Array, 
        required: true,
        default: () => [] 
    },
    actions: {
        type: Array,
        default: () => [],
        permission: {
            type: String,
            default: null,
        },
        validator: (actions) =>
            actions.every(
                (action) =>
                    typeof action.tooltip === 'string' &&
                    typeof action.handler === 'function' &&
                    typeof action.class === 'string'
            ),
        conditionShow: {
            type: Function,
            default: () => true,
        }
    },
    bulkActions: {
        type: Array,
        default: () => [],
    },
    pageSizeOptions: {
        type: Array,
        default: () => [5, 10, 25, 50, 100],
    },
    defaultPageSize: {
        type: Number,
        default: 10,
    },
    showAddButton: {
        type: Boolean,
        default: false,
    },
    showExport: {
        type: Boolean,
        default: false,
    },
    hasSelection: {
        type: Boolean,
        default: false,
    },
    selectable: {
        type: Boolean,
        default: false,
    },
    searchOptions: {
        type: Array,
        default: () => [],
        validator: (options) => options.every(opt => typeof opt.field === 'string' && typeof opt.label === 'string')
    },
    filterOptions: {
        type: Array,
        default: () => [],
        validator: (filters) => filters.every(filter => 
            typeof filter.field === 'string' && 
            typeof filter.label === 'string' &&
            (filter.type === 'select' || filter.type === 'date' || filter.type === 'checkbox') &&
            (filter.type !== 'select' || Array.isArray(filter.options))
        )
    },
    defaultSearchField: {
        type: String,
        default: ''
    },
    enableServerSearch: {
        type: Boolean,
        default: false
    },
    showRefreshButton: {
        type: Boolean,
        default: true
    },
        serverPagination: {
        type: Boolean,
        default: false
    },
    serverTotalItems: {
        type: Number,
        default: 0
    },
    serverCurrentPage: {
        type: Number,
        default: 1
    },
    serverPerPage: {
        type: Number,
        default: 10
    },
    serverLastPage: {
        type: Number,
        default: 1
    },
    showFilters: Boolean,
    filterOptions: {
        type: Array,
        default: () => []
    },
    initialFilters: {
        type: Object,
        default: () => ({})
    }
});

const emit = defineEmits([
    'add',
    'edit',
    'update:selectedRows',
    'export',
    'search',
    'filter',
    'bulk-action',
    'server-page-change',
    'server-sort',
    'server-filter',
    'refresh'
]);
const selectedSearchField = ref(props.defaultSearchField || (props.searchOptions.length > 0 ? props.searchOptions[0].field : ''));
const activeFilters = ref({});
const showFilters = ref(false);
const showSearchFields = ref(false);
const showRequireConfirmModal = ref(false);
const confirmMessage = ref('');
const currentAction = ref(null);

const showInputModal = ref(false);
const inputValue = ref('');
const titleModal = ref('');
const labelInputModal = ref('');
const placeholderInputModal = ref('');
const inputValidator = ref(null);


const getSearchFieldLabel = (field) => {
    const option = props.searchOptions.find(opt => opt.field === field);
    return option ? option.label : '';
};

const applyFilters = () => {
    if (hasErrors.value) return;
    emit('filter', activeFilters.value);
    showFilters.value = false;
};

const resetFilters = () => {
    activeFilters.value = {};
    dateRangeErrors.value = {};
    numberRangeErrors.value = {};
    
    initializeFilters();
    emit('filter', activeFilters.value);
};

const getDatePickerConfig = (filter, rangeType = 'from') => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Đặt giờ về 00:00:00 để so sánh ngày chính xác
  
  // Format helper functions
  const formatToDate = (dateStr) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? null : date;
  };

  const formatToYMD = (date) => {
    if (!date) return null;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Base config
  const baseConfig = {
    dateFormat: 'Y-m-d',
    altInput: true,
    altFormat: 'd/m/Y',
    locale: Vietnamese,
  };

  // Xử lý min/max date
  let minDate = formatToDate(filter.minDate);
  let maxDate = formatToDate(filter.maxDate);

  // Ràng buộc mặc định
  if (filter.preventFutureDates) {
    maxDate = maxDate ? new Date(Math.min(maxDate.getTime(), today.getTime())) : today;
  }

  if (filter.preventPastDates) {
    minDate = minDate ? new Date(Math.max(minDate.getTime(), today.getTime())) : today;
  }

  // Áp dụng min/max date đã xử lý
  baseConfig.minDate = minDate ? formatToYMD(minDate) : null;
  baseConfig.maxDate = maxDate ? formatToYMD(maxDate) : null;

  // Xử lý date-range
  if (filter.type === 'date-range') {
    const activeRange = activeFilters.value[filter.field] || {};
    
    if (rangeType === 'to') {
      // Ngày kết thúc phải ≥ ngày bắt đầu
      const fromDate = formatToDate(activeRange.from) || minDate;
      if (fromDate) {
        baseConfig.minDate = formatToYMD(fromDate);
      }
      
      // Nếu có cả maxDate từ filter và ràng buộc không tương lai
      if (filter.preventFutureDates) {
        baseConfig.maxDate = formatToYMD(today);
      }
    } else {
      // Ngày bắt đầu phải ≤ ngày kết thúc
      const toDate = formatToDate(activeRange.to) || maxDate;
      if (toDate) {
        baseConfig.maxDate = formatToYMD(toDate);
      }
      
      // Nếu có cả minDate từ filter và ràng buộc không quá khứ
      if (filter.preventPastDates) {
        baseConfig.minDate = formatToYMD(today);
      }
    }
  }

  return baseConfig;
};

const closeFilters = () => {
    showFilters.value = false;
    showSearchFields.value = false;
};

// State
const searchQuery = ref('');
const filteredData = ref([...props.rowData]);
const allColumns = ref([]);
const showColumnMenu = ref(false);
const showBulkActions = ref(false);
const selectedRows = ref([]);
const selectAll = ref(false);
const editingCell = ref(null);
const sortKey = ref('');
const sortOrder = ref('asc');
const currentPage = ref(1);
const pageSize = ref(props.defaultPageSize);
const goToPage = ref(1);
const columnFilters = ref({});
const hasSelection = computed(() => props.hasSelection || props.selectable);
const activeActionMenu = ref(null);
const dropdownDirection = ref('up');
const dropdownMenuPos = ref({ top: 0, left: 0 })
function toggleActionMenu(rowId, event) {
  if (activeActionMenu.value === rowId) {
    activeActionMenu.value = null
  } else {
    activeActionMenu.value = rowId
    nextTick(() => {
      const rect = event.currentTarget.getBoundingClientRect()
      dropdownMenuPos.value = {
        top: rect.bottom + window.scrollY,
        left: rect.left - 100 + window.scrollX,
      }
    })
  }
}

 const closeActionMenu = () => {
    activeActionMenu.value = null
  }
const dropdownPositionStyle = computed(() => ({
  top: dropdownMenuPos.value.top + 'px',
  left: dropdownMenuPos.value.left + 'px',
  position: 'fixed',
  zIndex: 99999, // đảm bảo nổi lên
}))
const dateRangeErrors = ref({});
const numberRangeErrors = ref({});

// Initialize filters
const initializeFilters = () => {
    props.filterOptions.forEach(filter => {
        if (filter.type === 'date-range' || filter.type === 'number-range') {
            if (!activeFilters.value[filter.field]) {
                activeFilters.value[filter.field] = { from: null, to: null };
            }
        } else if (filter.type === 'select' && filter.getCategory) {
            if (!categorySystem.loaded) {
                categorySystem.initCategories();
            }
            const options = categorySystem.getItemsByTypeCode(filter.categoryName);
            filter.options = options.map(option => ({
                label: option.name,
                value: option.code
            }));
            
        } else if (!activeFilters.value[filter.field]) {
            activeFilters.value[filter.field] = null;
        }
    });
};

// Validate number range
const validateNumberRange = (field) => {
    const range = activeFilters.value[field];
    if (!range) return;
    
    const filterConfig = props.filterOptions.find(f => f.field === field);
    
    // Check if min is greater than max
    if (range.min !== null && range.max !== null && range.min > range.max) {
        numberRangeErrors.value[field] = t('errors.min_greater_than_max');
        return;
    }
    
    // Check against min/max limits if defined
    if (filterConfig?.minLimit !== undefined && range.min !== null && range.min < filterConfig.minLimit) {
        numberRangeErrors.value[field] = t('errors.min_below_limit', { limit: filterConfig.minLimit });
        return;
    }
    
    if (filterConfig?.maxLimit !== undefined && range.max !== null && range.max > filterConfig.maxLimit) {
        numberRangeErrors.value[field] = t('errors.max_above_limit', { limit: filterConfig.maxLimit });
        return;
    }
    
    // Clear error if validation passes
    delete numberRangeErrors.value[field];
};

// Validate date range (keep your existing implementation)
const validateDateRange = (field) => {
    // ... (your existing date range validation code)
};

// Check if there are any errors
const hasErrors = computed(() => {
    return Object.keys(dateRangeErrors.value).length > 0 || 
           Object.keys(numberRangeErrors.value).length > 0;
});

// Count active filters
const activeFilterCount = computed(() => {
    let count = 0;
    for (const key in activeFilters.value) {
        if (activeFilters.value[key] !== null && 
            activeFilters.value[key] !== undefined && 
            activeFilters.value[key] !== '' &&
            !(typeof activeFilters.value[key] === 'object' && 
              Object.values(activeFilters.value[key]).every(val => val === null || val === '' || val === undefined))) {
            count++;
        }
    }
    return count;
});



// Initialize on mount
initializeFilters();
// Initialize columns with visibility and filter options
onMounted(async() => {
    allColumns.value = props.columns.map(column => ({
        field: column.field,
        label: column.label || column.field,
        visible: column.visible !== false,
        filterable: column.filterable || false,
        filterActive: false,
        filterValue: '',
        searchable: column.searchable !== false,
        sortable: column.sortable || false,
        formatter: column.formatter || null,
        isHtml: column.isHtml || null,
        headerAlign: column.headerAlign || 'left',
        editingCell: column.editingCell || false,
        align: column.align || 'left',
        cellClass: column.cellClass || null,
        isShow: column.isShow !== false,
    })).filter(column => {
        // Chỉ hiển thị các cột có isShow là true
        return column.isShow;
    });
    
});
watch(
  () => props.columns,
  (newColumns) => {
    allColumns.value = newColumns.map(column => ({
        field: column.field,
        label: column.label || column.field,
        visible: column.visible !== false,
        filterable: column.filterable || false,
        filterActive: false,
        filterValue: '',
        searchable: column.searchable !== false,
        sortable: column.sortable || false,
        formatter: column.formatter || null,
        isHtml: column.isHtml || null,
        headerAlign: column.headerAlign || 'left',
        editingCell: column.editingCell || false,
        align: column.align || 'left',
        cellClass: column.cellClass || null,
        isShow: column.isShow !== false,
    })).filter(column => {
      // Chỉ hiển thị các cột có isShow là true
      return column.isShow;
    });
  },
  { immediate: true, deep: true }
);
watch(
  () => props.rowData,
  (newData) => {
    filteredData.value = [...newData];
  },
  { immediate: true } // Cập nhật ngay lần đầu tiên
);

// Computed properties
const visibleColumns = computed(() => allColumns.value.filter(col => col.visible));
const totalColumns = computed(() => visibleColumns.value.length + (hasSelection.value ? 1 : 0) + (hasActions.value ? 1 : 0));
const hasActions = computed(() => props.actions.length > 0);

const totalItems = computed(() => {
    return props.serverPagination
        ? props.serverTotalItems
        : filteredData.value.length;
});

const paginatedData = computed(() => {
    return props.serverPagination
        ? props.rowData
        : filteredData.value.slice(
            (currentPage.value - 1) * pageSize.value,
            currentPage.value * pageSize.value
          );
});

const totalPages = computed(() => {
    return props.serverPagination 
        ? props.serverLastPage 
        : Math.ceil(filteredData.value.length / pageSize.value) || 1;
});

const displayedPages = computed(() => {
    const pages = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage.value - 2);
    let endPage = Math.min(totalPages.value, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
    }
    return pages;
});

// Watch for changes
watch(selectAll, (newVal) => {
    if (newVal) {
        selectedRows.value = [...paginatedData.value];
    } else {
        selectedRows.value = [];
    }
    emit('update:selectedRows', selectedRows.value);
});

watch(selectedRows, (newVal) => {
    selectAll.value = newVal.length === paginatedData.value.length && paginatedData.value.length > 0;
    emit('update:selectedRows', newVal);
}, { deep: true });

watch(pageSize, () => {
    if (props.serverPagination) {
        emit('server-page-change', {
            page: currentPage.value,
            perPage: pageSize.value
        });
    } else {
        currentPage.value = 1; // Reset về trang đầu tiên cho client-side
    }
});

watch(currentPage, (newVal) => {
    if (props.serverPagination) {
        emit('server-page-change', {
            page: newVal,
            perPage: pageSize.value
        });
    } else {
        goToPage.value = newVal;
    }
});
watch(() => props.serverCurrentPage, (newPage) => {
    if (props.serverPagination && newPage !== currentPage.value) {
        currentPage.value = newPage;
        goToPage.value = newPage;
    }
});

watch(() => props.serverPerPage, (newPerPage) => {
    if (props.serverPagination && newPerPage !== pageSize.value) {
        pageSize.value = newPerPage;
    }
});

// Methods
const filterData = () => {
   
    if (props.enableServerSearch || props.serverPagination) {
        emit('server-filter', {
            query: searchQuery.value,
            field: selectedSearchField.value,
            filters: activeFilters.value,
            columnFilters: columnFilters.value
        });
        return;
    }

    let result = [...props.rowData];
    const q = searchQuery.value.toLowerCase();
    
    if (q) {
        result = result.filter((row) =>
            Object.entries(row).some(([key, val]) => {
                const column = allColumns.value.find(col => col.field === key);
                if (column && column.searchable === false) return false;
                return String(val).toLowerCase().includes(q);
            })
        );
    }
    
    // Apply column filters
    Object.entries(columnFilters.value).forEach(([field, value]) => {
        if (value) {
            result = result.filter(row => 
                String(row[field]).toLowerCase().includes(value.toLowerCase())
            );
        }
    });
    
    filteredData.value = result;
    currentPage.value = 1;
};

const sort = (field, sortable) => {
    if (!sortable) return; // Không cho phép sắp xếp nếu cột không sortable
    if (sortKey.value === field) {
        sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
    } else {
        sortKey.value = field;
        sortOrder.value = 'asc';
    }
    
    if (props.serverPagination) {
        emit('server-sort', {
            field: field,
            direction: sortOrder.value
        });
    } else {
        filteredData.value = [...filteredData.value].sort((a, b) => {
            const A = a[field];
            const B = b[field];
            if (A === B) return 0;
            return sortOrder.value === 'asc' ? (A > B ? 1 : -1) : (A < B ? 1 : -1);
        });
    }
};

// Column drag and drop
let draggedColumn = null;

const dragStart = (e, column) => {
    draggedColumn = column;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', column.field);
};

const drop = (e, targetColumn) => {
    if (!draggedColumn || draggedColumn === targetColumn) return;
    const fromIdx = allColumns.value.findIndex((c) => c.field === draggedColumn.field);
    const toIdx = allColumns.value.findIndex((c) => c.field === targetColumn.field);
    const newCols = [...allColumns.value];
    newCols.splice(fromIdx, 1);
    newCols.splice(toIdx, 0, draggedColumn);
    allColumns.value = newCols;
};

// Editing
const startEdit = (rowId, field, editCell) => {

    if (!editCell) return; // Chỉ cho phép chỉnh sửa một ô tại một thời điểm
    editingCell.value = `${rowId}-${field}`;
};

const saveEdit = (row) => {
    editingCell.value = null;
    emit('edit', row);
};

// Row selection
const toggleRowSelection = (row) => {
    const index = selectedRows.value.findIndex(r => r.id === row.id);
    if (index >= 0) {
        selectedRows.value.splice(index, 1);
    } else {
        selectedRows.value.push(row);
    }
};

const isRowSelected = (row) => {
    return selectedRows.value.some(r => r.id === row.id);
};

// Bulk actions
const handleBulkAction = (action) => {
    showBulkActions.value = false;
    // Nếu action yêu cầu xác nhận
    if (action.requireInput) {
        showInputModal.value = true;
        currentAction.value = action;
        titleModal.value = action.title || t('common.confirm');
        labelInputModal.value = action.inputLabel || '';
        placeholderInputModal.value = action.inputPlaceholder || 'Nhập giá trị';
        inputValidator.value = action.inputValidator || null;
        const message = typeof action.confirmMessage === 'function' 
            ? action.confirmMessage(selectedRows.value.length)
            : action.confirmMessage;
        confirmMessage.value = message || 'Bạn có chắc chắn muốn thực hiện hành động này?';
    } else if (action.requireConfirm) {
        // Lưu action hiện tại và thông tin cần thiết
        currentAction.value = action;
        const message = typeof action.confirmMessage === 'function' 
        ? action.confirmMessage(selectedRows.value.length)
        : action.confirmMessage;
        
        confirmMessage.value = message || 'Bạn có chắc chắn muốn thực hiện hành động này?';
        showRequireConfirmModal.value = true;
    } else {
        // Thực hiện ngay nếu không cần xác nhận
        executeAction(action);
    }
};

// Hàm thực thi action
const executeAction = (action, input = '') => {
    try {
        action.handler(selectedRows.value, input);
    } catch (error) {
        console.error('Error handling bulk action:', error);
    }
};

// Hàm xác nhận từ modal
const confirmBulkModal = () => {
    if (currentAction.value) {
        executeAction(currentAction.value);
    }
    closeBulkModal();
};

const handleInputConfirm = (value) => {
    if (currentAction.value) {
    executeAction(currentAction.value, value);
    }
    closeBulkModal();
};

// Hàm đóng modal
const closeBulkModal = () => {
    showInputModal.value = false;
    showRequireConfirmModal.value = false;
    currentAction.value = null;
};
const filteredActions = (row) => {
    return props.actions.filter(action => {
        // Kiểm tra cả điều kiện hiển thị và permission nếu có
        const showByCondition = typeof action.conditionShow === 'function' 
            ? action.conditionShow(row) 
            : true;
            
        return showByCondition;
    });
};

// Column filtering
const hasActiveFilters = computed(() => {
    return visibleColumns.value.some(col => col.filterActive);
});
const toggleColumnFilter = (column) => {
    // Tắt tất cả các filter khác trước
    visibleColumns.value.forEach(col => {
        if (col !== column) {
            col.filterActive = false;
            col.filterValue = '';
            delete columnFilters.value[col.field];
        }
    });
    
    // Bật/tắt filter cho cột hiện tại
    column.filterActive = !column.filterActive;
    
    if (!column.filterActive) {
        column.filterValue = '';
        delete columnFilters.value[column.field];
    }
    
    // Áp dụng filter
    filterData();
    
    // Focus vào input nếu filter được bật
    if (column.filterActive) {
        nextTick(() => {
            const colIndex = visibleColumns.value.indexOf(column) + (hasSelection.value ? 1 : 0);
            const input = document.querySelector(`tr:nth-child(2) th:nth-child(${colIndex + 1}) input`);
            if (input) input.focus();
        });
    }
};

const applyColumnFilter = (column) => {
    if (column.filterValue) {
        columnFilters.value[column.field] = column.filterValue;
    } else {
        delete columnFilters.value[column.field];
    }
    filterData();
};

// Pagination
const goToSpecificPage = () => {
    const page = Math.max(1, Math.min(goToPage.value, totalPages.value));
    currentPage.value = page;
    
    if (props.serverPagination) {
        emit('server-page-change', {
            page: page,
            perPage: pageSize.value
        });
    }
};
// Cell formatting
const formatCellValue = (value, column, row) => {
    if (column.formatter) {
        return column.formatter(value, row);
    }
    return value;
};

// Export
const exportData = () => {
    emit('export', filteredData.value);
};
const getCellClass = (value, column) => {
  // Class mặc định
  let classes = 'text-gray-500 dark:text-gray-400';
  
  // Nếu column có định nghĩa cellClass
  if (column.cellClass) {
    if (typeof column.cellClass === 'function') {
      classes += ' ' + column.cellClass(value);
    } else {
      classes += ' ' + column.cellClass;
    }
  }
  
  return classes;
};
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
    height: 8px;
    width: 8px;
}

.custom-scrollbar::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
}

.dark .custom-scrollbar::-webkit-scrollbar-track {
    background: #2d3748;
}

.dark .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #4a5568;
}

.dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #718096;
}
/* Thêm transition cho filter panel */
.filter-panel-enter-active, .filter-panel-leave-active {
    transition: opacity 0.2s, transform 0.2s;
}
.filter-panel-enter-from, .filter-panel-leave-to {
    opacity: 0;
    transform: translateY(-10px);
}
</style>