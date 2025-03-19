import { useEffect, useState } from 'react';

function AdminDashboard() {
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        fetch('/api/orders')
            .then(res => res.json())
            .then(data => setOrders(data));
    }, []);

    const updateOrderStatus = (id) => {
        fetch(`/api/update-order/${id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'Shipped' })
        })
        .then(response => response.json())
        .then(() => alert('Order status updated!'))
        .catch(err => console.error(err));
    };

    return (
        <div>
            <h1>Admin Dashboard</h1>
            <table>
                <thead>
                    <tr>
                        <th>Order ID</th>
                        <th>Customer Name</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map(order => (
                        <tr key={order._id}>
                            <td>{order._id}</td>
                            <td>{order.name}</td>
                            <td>{order.status}</td>
                            <td>
                                <button onClick={() => updateOrderStatus(order._id)}>Mark as Shipped</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default AdminDashboard;
