<script setup lang="ts">
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// Reactive data
const allInvoices = ref([]); // Holds all fetched data
const invoices = ref([]); // Holds the data for the current page
const isLoading = ref(false); // Loading state
const itemsPerPage = 5; // Number of rows per page
const currentPage = ref(1); // Current page number
const totalItems = ref(0); // Total number of items (for pagination)
const filterStatus = ref(''); // Filter by status

// Computed property to calculate the total number of pages
const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage));

// Function to fetch all data (simulate fetching from an API)
const fetchAllInvoices = async () => {
  isLoading.value = true;
  try {
    const response = await fetch('/invoices.json');
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const { data } = await response.json();
    allInvoices.value = data; // Store all data
    totalItems.value = data.length; // Set total items
    applyFilters(); // Apply filters after fetching
  } catch (error) {
    console.error('Error fetching invoices:', error);
  } finally {
    isLoading.value = false;
  }
};

// Function to apply filters and pagination
const applyFilters = () => {
  let filteredData = allInvoices.value;

  // Apply status filter
  if (filterStatus.value) {
    filteredData = filteredData.filter(invoice => invoice.status === filterStatus.value);
  }

  // Update total items after filtering
  totalItems.value = filteredData.length;

  // Paginate the filtered data
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  invoices.value = filteredData.slice(start, end);
};

// Function to change the current page
const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
    applyFilters(); // Reapply filters and pagination
  }
};

// Fetch all data when the component is mounted
onMounted(() => {
  fetchAllInvoices();
});
</script>

<template>
  <div>
    <!-- Filter UI
    <div class="flex justify-end mb-4">
      <select v-model="filterStatus" @change="applyFilters" class="px-3 py-2 border rounded">
        <option value="">All Statuses</option>
        <option value="Paid">Paid</option>
        <option value="Pending">Pending</option>
        <option value="Unpaid">Unpaid</option>
      </select>
    </div>

    <Table>
      <TableCaption>A list of your recent invoices.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead class="w-[50px]">
            #
          </TableHead>
          <TableHead class="w-[100px]">
            Invoice
          </TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Method</TableHead>
          <TableHead class="text-right">
            Amount
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow v-if="isLoading">
          <TableCell colspan="5" class="text-center py-4">
            Loading...
          </TableCell>
        </TableRow>
        <TableRow v-else v-for="(invoice, index) in invoices" :key="invoice.invoice">
          <TableCell class="font-medium">
            {{ (currentPage - 1) * itemsPerPage + index + 1 }}
          </TableCell>
          <TableCell class="font-medium">
            {{ invoice.invoice }}
          </TableCell>
          <TableCell>{{ invoice.status }}</TableCell>
          <TableCell>{{ invoice.method }}</TableCell>
          <TableCell class="text-right">
            ${{ invoice.amount.toFixed(2) }}
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>

    
    <div class="flex justify-center mt-4">
      <button
        v-for="page in totalPages"
        :key="page"
        @click="goToPage(page)"
        :class="['mx-1 px-3 py-1 rounded', currentPage === page ? 'bg-blue-500 text-white' : 'bg-gray-200']"
      >
        {{ page }}
      </button>
    </div> -->
    products
  </div>
</template>