import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ImageOff, Minus, Plus, Trash2, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { useCart } from '../../contexts/CartContext';
import { formatCurrency } from '../../utils/formatters';
import '../../pages/Store/StoreProductPage.css';

export default function CartDrawer() {
  const navigate = useNavigate();
  const {
    cartItems,
    selectedCartItemCount,
    selectedCartSubtotal,
    hasUnpricedSelectedItems,
    allCartItemsSelected,
    someCartItemsSelected,
    cartLoading,
    cartError,
    cartOpen,
    closeCart,
    refreshCart,
    clearCart,
    updateCartItemQuantity,
    selectCartItem,
    selectAllCartItems,
    removeCartItem,
  } = useCart();
  const [confirmClearCart, setConfirmClearCart] = useState(false);
  const [clearingCart, setClearingCart] = useState(false);
  const [removingItemId, setRemovingItemId] = useState(null);
  const [updatingItemId, setUpdatingItemId] = useState(null);
  const [selectionBusy, setSelectionBusy] = useState(false);
  const [itemToRemove, setItemToRemove] = useState(null);
  const selectAllRef = useRef(null);
  const confirmOpen = confirmClearCart || itemToRemove !== null;
  const confirmationBusy = clearingCart || removingItemId !== null || updatingItemId !== null || selectionBusy;

  useEffect(() => {
    if (selectAllRef.current) selectAllRef.current.indeterminate = someCartItemsSelected;
  }, [someCartItemsSelected]);

  useEffect(() => {
    if (!confirmOpen || confirmationBusy) return undefined;
    const handleKeyDown = event => {
      if (event.key === 'Escape') {
        setConfirmClearCart(false);
        setItemToRemove(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [confirmOpen, confirmationBusy]);

  if (!cartOpen) return null;

  const handleClearCart = async () => {
    if (cartItems.length === 0 || confirmationBusy || itemToRemove !== null) return;
    setClearingCart(true);
    try {
      await clearCart();
      setConfirmClearCart(false);
      toast.success('Đã xóa toàn bộ sản phẩm khỏi giỏ hàng.');
    } catch (error) {
      toast.error(error.message || 'Không thể xóa giỏ hàng. Vui lòng thử lại.');
    } finally {
      setClearingCart(false);
    }
  };

  const handleRemoveItem = async () => {
    const item = itemToRemove;
    if (!item || confirmationBusy) return;
    if (!item.itemId) {
      toast.error('Không tìm thấy mã mục giỏ hàng. Hãy tải lại giỏ hàng rồi thử lại.');
      return;
    }
    setRemovingItemId(String(item.itemId));
    try {
      await removeCartItem(item.itemId);
      setItemToRemove(null);
      toast.success('Đã xóa sản phẩm khỏi giỏ hàng.');
    } catch (error) {
      toast.error(error.message || 'Không thể xóa sản phẩm. Vui lòng thử lại.');
    } finally {
      setRemovingItemId(null);
    }
  };

  const handleQuantityChange = async (item, quantity) => {
    if (confirmationBusy || confirmOpen || Number(quantity) === item.quantity) return;
    if (!item.itemId) {
      toast.error('Không tìm thấy mã mục giỏ hàng. Hãy tải lại giỏ hàng rồi thử lại.');
      return;
    }
    setUpdatingItemId(String(item.itemId));
    try {
      await updateCartItemQuantity(item.itemId, quantity);
    } catch (error) {
      toast.error(error.message || 'Không thể cập nhật số lượng. Vui lòng thử lại.');
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleSelectItem = async (item, isSelected) => {
    if (confirmationBusy || confirmOpen) return;
    if (!item.itemId) {
      toast.error('Không tìm thấy mã mục giỏ hàng. Hãy tải lại giỏ hàng rồi thử lại.');
      return;
    }
    setSelectionBusy(true);
    try {
      await selectCartItem(item.itemId, isSelected);
    } catch (error) {
      toast.error(error.message || 'Không thể cập nhật lựa chọn. Vui lòng thử lại.');
    } finally {
      setSelectionBusy(false);
    }
  };

  const handleSelectAll = async isSelected => {
    if (confirmationBusy || confirmOpen) return;
    setSelectionBusy(true);
    try {
      await selectAllCartItems(isSelected, isSelected);
    } catch (error) {
      toast.error(error.message || 'Không thể cập nhật lựa chọn. Vui lòng thử lại.');
    } finally {
      setSelectionBusy(false);
    }
  };

  return (
    <div className="rains-drawer-backdrop" onClick={closeCart}>
      <aside className="rains-cart-drawer" onClick={event => event.stopPropagation()} aria-label="Giỏ hàng" role="dialog" aria-modal="true">
        <div className="rains-drawer-header">
          <h3 className="rains-drawer-title">Giỏ hàng</h3>
          <div className="rains-drawer-header-actions">
            {!cartLoading && !cartError && cartItems.length > 0 && (
              <button
                type="button"
                className="rains-cart-clear-all"
                onClick={() => { setItemToRemove(null); setConfirmClearCart(true); }}
                disabled={confirmationBusy || itemToRemove !== null}
              >
                <Trash2 size={14} />
                Xóa tất cả
              </button>
            )}
            <button className="rains-drawer-close" onClick={closeCart} title="Đóng giỏ hàng" aria-label="Đóng giỏ hàng">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="rains-cart-items-list">
          {!cartLoading && !cartError && cartItems.length > 0 && (
            <div className="rains-cart-selection-bar">
              <label className="rains-cart-select-control">
                <input
                  ref={selectAllRef}
                  type="checkbox"
                  checked={allCartItemsSelected}
                  onChange={event => handleSelectAll(event.target.checked)}
                  disabled={confirmationBusy || confirmOpen}
                  aria-label="Chọn tất cả sản phẩm còn khả dụng"
                />
                <span>Chọn tất cả</span>
              </label>
              <span className="rains-cart-selected-count">Đã chọn {selectedCartItemCount} sản phẩm</span>
            </div>
          )}
          {cartLoading ? (
            <p role="status">Đang tải giỏ hàng...</p>
          ) : cartError ? (
            <div role="alert">
              <p>{cartError}</p>
              <button type="button" onClick={refreshCart}>Thử tải lại</button>
            </div>
          ) : cartItems.length === 0 ? (
            <p>Giỏ hàng của bạn đang trống.</p>
          ) : cartItems.map((item, index) => (
            <div key={item.id || index} className="rains-cart-row">
              <div className="rains-cart-item-leading">
                <label className="rains-cart-item-select">
                  <input
                    type="checkbox"
                    checked={item.isSelected}
                    onChange={event => handleSelectItem(item, event.target.checked)}
                    disabled={confirmationBusy || confirmOpen}
                    aria-label={`Chọn ${item.name}`}
                  />
                </label>
                <div className="rains-cart-thumb-wrap">
                  {item.img ? <img src={item.img} alt={item.name} className="rains-cart-thumb" /> : <span role="img" aria-label={`Chưa có ảnh ${item.name}`}><ImageOff size={22} aria-hidden="true" /></span>}
                </div>
              </div>
              <div className="rains-cart-details">
                <h4 className="rains-cart-item-name">{item.name}</h4>
                <p className="rains-cart-item-variant">{item.color} / {item.size}</p>
                <p className="rains-cart-item-price">{item.price === null ? 'Chưa cập nhật giá' : formatCurrency(item.price)}</p>
                <div className="rains-cart-item-actions">
                  <div className="rains-qty-control">
                    <button className="rains-qty-btn" onClick={() => handleQuantityChange(item, item.quantity - 1)} aria-label="Giảm số lượng" disabled={confirmationBusy || confirmOpen || item.quantity <= 1}>
                      <Minus size={14} />
                    </button>
                    <span className="rains-qty-val">{item.quantity}</span>
                    <button className="rains-qty-btn" onClick={() => handleQuantityChange(item, item.quantity + 1)} aria-label="Tăng số lượng" disabled={confirmationBusy || confirmOpen || item.quantity >= item.maxQuantity}>
                      <Plus size={14} />
                    </button>
                  </div>
                  <button className="rains-cart-remove" onClick={() => setItemToRemove(item)} disabled={confirmationBusy || confirmOpen}>
                    {removingItemId === String(item.itemId) ? 'Đang xóa...' : 'Xóa'}
                  </button>
                </div>
              </div>
            </div>
          ))}

          <div className="rains-cart-delivery">
            <span className="rains-cart-delivery-label">Giao hàng</span>
            <span className="rains-cart-delivery-val">Xác nhận khi đặt hàng</span>
          </div>
        </div>

        <div className="rains-drawer-footer">
          <div className="rains-subtotal-row">
            <span>Tạm tính ({selectedCartItemCount} sản phẩm đã chọn)</span>
            <strong>{selectedCartSubtotal === null ? '—' : formatCurrency(selectedCartSubtotal)}</strong>
          </div>
          <div className="rains-footer-actions">
            <button className="rains-view-cart-link" onClick={closeCart}>Xem giỏ hàng</button>
            <button
              className="rains-checkout-btn"
              onClick={() => { closeCart(); navigate('/checkout'); }}
              disabled={selectedCartItemCount === 0 || confirmationBusy || hasUnpricedSelectedItems}
            >
              Thanh toán
            </button>
          </div>
        </div>
      </aside>
      {confirmOpen && (
        <div
          className="rains-cart-confirm-overlay"
          onClick={event => {
            event.stopPropagation();
            if (!confirmationBusy) {
              setConfirmClearCart(false);
              setItemToRemove(null);
            }
          }}
        >
          <section
            className="rains-cart-confirm-dialog"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="rains-cart-confirm-title"
            aria-describedby="rains-cart-confirm-description"
            onClick={event => event.stopPropagation()}
          >
            <span className="rains-cart-confirm-icon" aria-hidden="true"><Trash2 size={20} /></span>
            <h4 id="rains-cart-confirm-title">{confirmClearCart ? 'Xóa toàn bộ giỏ hàng?' : 'Xóa sản phẩm?'}</h4>
            <p id="rains-cart-confirm-description">
              {confirmClearCart
                ? 'Bạn có chắc muốn xóa toàn bộ sản phẩm khỏi giỏ hàng không?'
                : <>Bạn có muốn xóa <strong>{itemToRemove?.name}</strong> khỏi giỏ hàng không?</>}
            </p>
            <div className="rains-cart-confirm-actions">
              <button
                type="button"
                className="rains-cart-confirm-cancel"
                onClick={() => { setConfirmClearCart(false); setItemToRemove(null); }}
                disabled={confirmationBusy}
              >
                Hủy
              </button>
              <button
                type="button"
                className="rains-cart-confirm-delete"
                onClick={confirmClearCart ? handleClearCart : handleRemoveItem}
                disabled={confirmationBusy}
              >
                {confirmationBusy ? 'Đang xóa...' : confirmClearCart ? 'Xóa tất cả' : 'Xóa sản phẩm'}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
