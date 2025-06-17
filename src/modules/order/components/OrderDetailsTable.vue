<template>
    <div>
        <table class="w-full">
            <thead>
                <tr>
                    <th>{{ t('orders.details.package_name') }}</th>
                    <th>{{ t('orders.details.base_price') }}</th>
                    <th>{{ t('orders.details.quantity') }}</th>
                    <th>{{ t('orders.details.start_date') }}</th>
                    <th>{{ t('orders.details.end_date') }}</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(detail, idx) in modelValue" :key="idx">
                    <td>
                        <input 
                            :value="detail.package_name" 
                            @input="updateDetail(idx, 'package_name', ($event.target as HTMLInputElement).value)"
                            :readonly="readonly" 
                            class="input" 
                        />
                    </td>
                    <td>
                        <input 
                            type="number" 
                            :value="detail.base_price" 
                            @input="updateDetail(idx, 'base_price', parseFloat(($event.target as HTMLInputElement).value) || 0)"
                            :readonly="readonly" 
                            class="input" 
                        />
                    </td>
                    <td>
                        <input 
                            type="number" 
                            :value="detail.quantity" 
                            @input="updateDetail(idx, 'quantity', parseInt(($event.target as HTMLInputElement).value) || 1)"
                            :readonly="readonly" 
                            class="input" 
                        />
                    </td>
                    <td>
                        <input 
                            type="date" 
                            :value="detail.start_date" 
                            @input="updateDetail(idx, 'start_date', ($event.target as HTMLInputElement).value)"
                            :readonly="readonly" 
                            class="input" 
                        />
                    </td>
                    <td>
                        <input 
                            type="date" 
                            :value="detail.end_date" 
                            @input="updateDetail(idx, 'end_date', ($event.target as HTMLInputElement).value)"
                            :readonly="readonly" 
                            class="input" 
                        />
                    </td>
                    <td>
                        <button 
                            v-if="!readonly" 
                            @click="removeDetail(idx)" 
                            class="text-red-500 hover:text-red-700"
                            type="button"
                        >
                            ×
                        </button>
                    </td>
                </tr>
            </tbody>
        </table>
        <button 
            v-if="!readonly" 
            @click="addDetail" 
            type="button"
            class="mt-2 px-2 py-1 bg-emerald-500 text-white rounded hover:bg-emerald-600"
        >
            + {{ t('orders.details.add') }}
        </button>
    </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

interface OrderDetail {
    package_name: string
    base_price: number
    quantity: number
    start_date: string
    end_date: string
}

const props = defineProps<{
    modelValue: OrderDetail[]
    readonly?: boolean
}>()

const emit = defineEmits<{
    'update:modelValue': [value: OrderDetail[]]
}>()

const addDetail = () => {
    const newDetail: OrderDetail = {
        package_name: '',
        base_price: 0,
        quantity: 1,
        start_date: '',
        end_date: ''
    }
    emit('update:modelValue', [...props.modelValue, newDetail])
}

const removeDetail = (idx: number) => {
    const updatedDetails = props.modelValue.filter((_, index) => index !== idx)
    emit('update:modelValue', updatedDetails)
}

const getInputValue = (event: Event): string => {
    const target = event.target as HTMLInputElement
    return target?.value || ''
}

const updateDetail = (idx: number, field: keyof OrderDetail, value: string | number) => {
    const updatedDetails = [...props.modelValue]
    updatedDetails[idx] = { ...updatedDetails[idx], [field]: value }
    emit('update:modelValue', updatedDetails)
}

const handleStringInput = (idx: number, field: keyof OrderDetail, event: Event) => {
    updateDetail(idx, field, getInputValue(event))
}

const handleNumberInput = (idx: number, field: keyof OrderDetail, event: Event, parser: (val: string) => number) => {
    updateDetail(idx, field, parser(getInputValue(event)))
}
</script>