// scripts/admin.js

document.addEventListener('DOMContentLoaded', () => {
    // Handle order status change
    const statusSelects = document.querySelectorAll('.status-select');
    
    statusSelects.forEach(select => {
      select.addEventListener('change', (event) => {
        const orderId = event.target.getAttribute('data-order-id');
        const newStatus = event.target.value;
        
        // Send an update request to the server
        fetch(`/admin/update-status/${orderId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: newStatus }),
        })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            alert('Order status updated successfully');
          } else {
            alert('Error updating order status');
          }
        })
        .catch(error => {
          console.error('Error:', error);
          alert('Error updating order status');
        });
      });
    });
  
    // Handle delete order
    const deleteBtns = document.querySelectorAll('.delete-btn');
  
    deleteBtns.forEach(button => {
      button.addEventListener('click', (event) => {
        const orderId = event.target.getAttribute('data-order-id');
        
        // Confirm the delete action
        const confirmDelete = confirm('Are you sure you want to delete this order?');
        if (confirmDelete) {
          // Send delete request to the server
          fetch(`/admin/delete-order/${orderId}`, {
            method: 'DELETE',
          })
          .then(response => response.json())
          .then(data => {
            if (data.success) {
              alert('Order deleted successfully');
              event.target.closest('tr').remove(); // Remove row from table
            } else {
              alert('Error deleting order');
            }
          })
          .catch(error => {
            console.error('Error:', error);
            alert('Error deleting order');
          });
        }
      });
    });
  });
  