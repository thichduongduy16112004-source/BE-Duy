import { Download, ReceiptText } from 'lucide-react';
import { useEffect, useState } from 'react';
import { EmptyState, Feedback, LoadingState } from '../components/Feedback';
import { apiService } from '../services/apiService';
import type { AdminTransaction } from '../services/apiService';

const currencyFormatter = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });

export default function BillingPage() {
  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadTransactions() {
      setIsLoading(true);
      setError('');
      try {
        const response = await apiService.getTransactions();
        if (isMounted) {
          setTransactions(response.transactions);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Không thể tải giao dịch.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadTransactions();
    return () => {
      isMounted = false;
    };
  }, []);

  async function exportCsv() {
    setError('');
    try {
      const blob = await apiService.exportTransactions();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'transactions.csv';
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể export CSV.');
    }
  }

  return (
    <div className="page-stack">
      <div className="command-panel hero-panel">
        <div>
          <p className="panel-kicker"><ReceiptText size={16} /> Billing</p>
          <h2>Đối soát PayOS và doanh thu</h2>
          <p>Xem giao dịch mới nhất, trạng thái thanh toán và export CSV cho kế toán/vận hành.</p>
        </div>
        <button className="primary-button" type="button" onClick={() => void exportCsv()}>
          <Download size={18} /> Export CSV
        </button>
      </div>

      <Feedback message={error} tone="error" />

      {isLoading ? <LoadingState label="Đang tải giao dịch..." /> : transactions.length === 0 ? (
        <EmptyState title="Chưa có giao dịch" description="Các thanh toán PayOS sẽ xuất hiện tại đây sau khi người dùng tạo đơn." />
      ) : (
        <div className="admin-table-card">
          <table className="admin-table">
            <thead>
              <tr><th>Mã đơn</th><th>Email</th><th>Số tiền</th><th>Gateway</th><th>Trạng thái</th><th>Ngày tạo</th></tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td><strong>{transaction.order_code || transaction.id}</strong><span>{transaction.plan_type}</span></td>
                  <td>{transaction.email || transaction.user_id}</td>
                  <td>{currencyFormatter.format(transaction.amount)}</td>
                  <td>{transaction.payment_gateway}</td>
                  <td><span className={`status-badge ${transaction.status === 'completed' ? 'status-active' : 'status-draft'}`}>{transaction.status}</span></td>
                  <td>{transaction.created_at ? new Date(transaction.created_at).toLocaleString('vi-VN') : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
