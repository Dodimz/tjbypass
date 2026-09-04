// Selecting the payment method
const methods = document.querySelectorAll(".payment_method");
let selectedGateway = "";

if (methods) {
   function methodHandler(element) {
      element.classList.remove("outline-gray-300");
      element.classList.add("outline-2", "outline-blue-500");
      const info = JSON.parse(element.dataset.info);
      document.getElementById("paymentMethod").innerText = info.name;
      selectedGateway = info.sub_type;

      const checkoutForm = document.getElementById("checkoutForm");
      checkoutForm.setAttribute("method", info.method);
      checkoutForm.setAttribute("action", info.route);

      const phoneInput = document.getElementById("otpPhone");
      if (phoneInput) {
         if (info.sub_type == 'sslcommerz') {
            phoneInput.classList.remove("hidden");
            phoneInput.classList.add("block");
            phoneInput.setAttribute('required', true);
         } else {
            phoneInput.classList.add("hidden");
            phoneInput.classList.remove("block");
            phoneInput.removeAttribute('required')
         }
      }
   }

   methods.forEach((element, index) => {
      element.classList.add("outline-gray-300");
      // checkoutForm
      if (index === 0) methodHandler(element);

      element.addEventListener("click", () => {
         methods.forEach((item) => {
            item.classList.add("outline-gray-300");
            item.classList.remove("outline-2", "outline-blue-500");
         });
         methodHandler(element);
      });
   });

   const checkout = document.getElementById("checkout");
   const paymentMethod = document.getElementById("paymentMethod").innerText;
   if (!Boolean(paymentMethod)) {
      checkout.setAttribute("disabled", true);
   }

   // Midtrans Snap integration
   const checkoutForm = document.getElementById("checkoutForm");
   if (checkoutForm) {
      checkoutForm.addEventListener("submit", function (e) {
         if (selectedGateway !== "midtrans") {
            return;
         }

         e.preventDefault();

         const formData = new FormData(checkoutForm);
         const action = checkoutForm.getAttribute("action");

         fetch(action, {
            method: "POST",
            headers: {
               "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]').getAttribute("content"),
               "X-Requested-With": "XMLHttpRequest",
               "Accept": "application/json",
            },
            body: formData,
         })
            .then(function (response) { return response.json(); })
            .then(function (data) {
               if (data.error) {
                  alert(data.error);
                  return;
               }

               // Dynamically load Snap JS
               var script = document.createElement("script");
               var snapBaseUrl = data.is_production
                  ? "https://app.midtrans.com/snap/snap.js"
                  : "https://app.sandbox.midtrans.com/snap/snap.js";
               script.src = snapBaseUrl;
               script.setAttribute("data-client-key", data.client_key);
               script.onload = function () {
                  window.snap.pay(data.snap_token, {
                     onSuccess: function () {
                        window.location.href = action.replace("/payment", "/success");
                     },
                     onPending: function () {
                        window.location.href = action.replace("/payment", "/success");
                     },
                     onClose: function () {
                        window.location.href = action.replace("/payment", "/cancel");
                     },
                  });
               };
               document.head.appendChild(script);
            })
            .catch(function (err) {
               alert("Payment failed: " + err.message);
            });
      });
   }
}
