export const initializePaystack = ({ email, amount, onSuccess, onClose, metadata = {}, ref }) => {
  const config = {
    key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
    email,
    amount: amount * 100, // kobo
    currency: 'NGN',
    metadata,
    callback: (response) => onSuccess(response.reference),
    onClose,
  };
  if (ref) config.ref = ref; // use a pre-created server-side reference
  const handler = window.PaystackPop.setup(config);
  handler.openIframe();
};
