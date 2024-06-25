jQuery(document).ready(function () {
  function getTotalProductQuantity() {
    let totalQuantity = 0;
    $(".mini-cart-items .mini-cart-item").each(function () {
      let quantity = parseInt($(this).find(".quantity").text());
      totalQuantity += quantity;
      console.log("totalQuantityfff:" + totalQuantity);
    });
    return totalQuantity;
  }

  // Function to update cart count and scroll to top
  function updateCartCountAndScrollToTop() {
    $.ajax({
      type: "GET",
      url: "/cart.js", // Endpoint to get cart information in Shopify
      dataType: "json",
      success: function (cartData) {
        // Extract item count from cartData
        var itemCount = cartData.item_count || 0; // Default to 0 if item_count is not available
        if (itemCount > 0) {
          $("#cart-icon-bubble").append(
            '<div class="cart-count-bubble"><span aria-hidden="true" class="cart-count-bubble">0</span></div>'
          );
        }

        $(".cart-count-bubble span").html(itemCount); // Update count in .cart-count-bubble span
        $(".cart-count-bubble").text(itemCount);

        // Scroll to top
        $("html, body").animate({ scrollTop: 0 }, "slow");

        // Update mini cart items
        let items = cartData.items;
        let miniCartItemsHtml = "";
        items.forEach(function (item) {
          miniCartItemsHtml += `<li class="mini-cart-item">
                                             <div class="item-details">
                                                 <p><b>Product Title:</b> ${
                                                   item.title
                                                 }</p>
                                                 <p><b>Product Quantity:</b> <span class="quantity">${
                                                   item.quantity
                                                 }</span></p>
                                                 <p class="current-product-price" ><b>Product Price:</b> <span>${(
                                                   item.price / 100
                                                 ).toFixed(2)} </span></p>
                                                  <div class="quantity-control">
                                                 <button class="decrease-quantity" data-itemprice="${(
                                                   item.price / 100
                                                 ).toFixed(
                                                   2
                                                 )}" data-variant-id="${
            item.variant_id
          }">-</button>
                                                 <input type="number" class="quantity-input" value="${
                                                   item.quantity
                                                 }" min="1">
                                                 <button class="increase-quantity" data-itemprice="${(
                                                   item.price / 100
                                                 ).toFixed(
                                                   2
                                                 )}" data-variant-id="${
            item.variant_id
          }">+</button>
                                             </div>
                                             <button class="delete-product" data-variant-id="${
                                               item.variant_id
                                             }">Delete</button>
                                      
                                             </div>
                                             <div class="item-image">
                                                 <b>Product Image:</b><br>
                                                 <img src="${
                                                   item.image
                                                 }" alt="${item.title}">
                                             </div>
                                            
                                         </li>`;
        });
        $(".mini-cart-items").html(miniCartItemsHtml);
        $(".mini-cart-popup").fadeIn();
      },
      error: function (xhr, ajaxOption, throwError) {
        console.log("Error updating cart count");
      },
    });
  }

  // Event listener for adding items to the cart
  jQuery(function ($) {
    // Function to retrieve and parse product variants
    function getProductVariants(productId) {
      var scriptSelector = "#product-variants-data-" + productId;
      var $scriptTag = $(scriptSelector);
      var scriptContent = $scriptTag.html();

      if (scriptContent) {
        try {
          var productVariants = JSON.parse(scriptContent.trim());
          console.log(
            "Product Variants for ID " + productId + ":",
            productVariants
          );
          return productVariants;
        } catch (e) {
          console.error(
            "Error parsing JSON for product ID " + productId + ":",
            e
          );
          return null;
        }
      } else {
        console.error(
          "Script tag with id " +
            scriptSelector +
            " not found or does not contain content."
        );
        return null;
      }
    }

    // Event listener for radio button changes
    $(".product-form__input input[type='radio']").on("change", function () {
      var $radio = $(this);
      var productId = $radio.closest(".variant-radios").data("product-id");

      var selectedValues = {};
      $(
        ".variant-radios[data-product-id='" +
          productId +
          "'] input[type='radio']:checked"
      ).each(function () {
        var groupName = $(this).attr("name");
        var value = $(this).val();
        selectedValues[groupName] = value;
      });

      console.log(
        "Selected Values for Product ID " + productId + ":",
        selectedValues
      );

      var combinedValue = Object.values(selectedValues).join(" / ");

      var productVariants = getProductVariants(productId);
      console.log("Product Variants:", productVariants);

      var matchingVariantId = null;

      if (productVariants) {
        for (var i = 0; i < productVariants.length; i++) {
          var variant = productVariants[i];
          if (variant.title === combinedValue) {
            matchingVariantId = variant.id;
            break;
          }
        }
      }

      $("#matching-variant-id").val(matchingVariantId);

      if (matchingVariantId) {
        console.log("Matching Variant ID:", matchingVariantId);
      } else {
        console.log(
          "No matching variant found for Combined Value:",
          combinedValue
        );
      }
    });
  });
  // Function to show success message for a specific variant
  function showSuccessMessage($context, message) {
    var alertMessage = $context.siblings(".alert-message");
    alertMessage.removeClass("error").addClass("success").text(message).show();
    setTimeout(function () {
      alertMessage.fadeOut();
    }, 5000); // Fade out after 5 seconds
  }

  // Function to show error message
  function showErrorMessage($context, message) {
    var alertMessage = $context.siblings(".alert-message");
    alertMessage.removeClass("success").addClass("error").text(message).show();
    setTimeout(function () {
      alertMessage.fadeOut();
    }, 5000); // Fade out after 5 seconds
  }

  $(".ajax-button-new").on("click", function () {
    var $button = $(this);
    var variantId = $("#matching-variant-id").val();

    if (variantId) {
      var quantity = 1; // You can set the quantity as needed

      // Ajax request to add variant to cart
      $.ajax({
        type: "POST",
        url: "/cart/add.js",
        data: {
          quantity: quantity,
          id: variantId,
        },
        dataType: "json",
        success: function (data) {
          // Handle success, e.g., update mini cart
          console.log("Product added to cart:", data);
          showSuccessMessage($button, "Success! Your product added to cart.");
          // Example: Update mini cart content
          updateCartCountAndScrollToTop();
          // After adding item, update item count
          getTotalProductQuantity();
          //updateMiniCart();
          addToMiniCart();
        },
        error: function (error) {
          // Handle errors
          console.error("Error adding product to cart:", error);
          showSuccessMessage(
            $button,
            "This product is sold out please select another variant"
          );
        },
      });
    } else {
      console.log("No matching variant ID to add to cart.");
    }
  });
  // Click handler for variant options
  $(".variant-option").on("click", function () {
    var $this = $(this);
    $(".variant-option").removeClass("selected");
    $(".color-swatch").removeClass("selected");
    var currentvariantid = $this.data("variant-id"); // Get current variant id
    console.log("currentvariantidttt:", currentvariantid);
    var $selectedColorSwatch = $this.next(".color-swatch");

    $this.addClass("selected");
    $selectedColorSwatch.addClass("selected");
    updateSelectedColorSwatch(currentvariantid); // Update selected color swatch
  });
  // Click handler for color swatches (optional, if needed separately)
  $(".color-swatch").on("click", function () {
    $(this).addClass("selected").siblings().removeClass("selected");
    updateSelectedColorSwatch(); // Update selected color swatch on swatch click
  });

  // Function to update selected color swatch
  function updateSelectedColorSwatch(currentvariantid) {
    console.log("currentvariantid:", currentvariantid);
    var $selectedColorSwatch = $(".color-swatch.selected");
    var selectedVariantOption = $selectedColorSwatch.data(
      currentvariantid + "-option"
    );
    console.log("Color Option:", selectedVariantOption);
    $(".color-display").css("background-color", selectedVariantOption);
    return selectedVariantOption; // Return selected option if needed
  }

  // Example of another function accessing currentvariantid

  // Function to add selected variant title to mini cart
  function addToMiniCart(variantTitle) {
    $(".mini-cart-items").append(`<li class="mini-cart-item">
            <div class="item-details">
                <p><b>Product Title:</b>${variantTitle}</p>
            </div>
        </li>`);
  }

  // Increase quantity button click handler
  $(document).on("click", ".increase-quantity", function () {
    let variantId = $(this).data("variant-id");
    console.log("variantId: " + variantId);

    // Call function to update cart
    var $input = $(this).siblings(".quantity-input");
    var newValue = parseInt($input.val()) + 1;

    $input.val(newValue);
    console.log("newvalue:" + newValue);
    updateQuantityAndPrice($input);
    getTotalProductQuantity(); // Update item count
  });

  // Decrease quantity button click handler
  $(document).on("click", ".decrease-quantity", function () {
    let variantId = $(this).data("variant-id");
    console.log("variantId: " + variantId);
    var $input = $(this).siblings(".quantity-input");
    var newValue = parseInt($input.val()) - 1;
    if (newValue >= 1) {
      $input.val(newValue);
      updateQuantityAndPrice($input);
      getTotalProductQuantity(); // Update item count
    }
  });

  // Delete product button click handler
  $(document).on("click", ".delete-product", function () {
    let variantId = $(this).data("variant-id");
    $.ajax({
      type: "POST",
      url: "/cart/change.js",
      data: { quantity: 0, id: variantId },
      dataType: "json",
      success: function (data) {
        console.log("Product deleted from cart successfully");
        updateCartCountAndScrollToTop();
        getTotalProductQuantity();
      },
      error: function (xhr, ajaxOption, throwError) {
        console.log("Error deleting product from cart");
      },
    });
  });
  function updateQuantityAndPrice($input) {
    var quantity = parseInt($input.val());
    var itemprice = $input.siblings(".increase-quantity").data("itemprice"); // Fetch the item price dynamically based on the variant
    console.log("itemprice" + itemprice);
    if (!isNaN(itemprice)) {
      var totalPrice = quantity * itemprice; // Calculate the total price

      // Update the quantity and total price
      $input
        .closest(".quantity-control")
        .siblings("p")
        .find(".quantity")
        .text(quantity);
      $input
        .closest(".item-details")
        .find(".current-product-price span")
        .text(totalPrice.toFixed(2));
      // Update the total item count
      var totalQuantity = getTotalProductQuantity();
      $(".cart-count-bubble span").html(totalQuantity);
      $(".cart-count-bubble").text(totalQuantity);
    } else {
      console.log("Error: Invalid item price");
    }
  }

  // Function to update cart quantity and product price
  function updateCart(itemIndex, newQuantity) {
    // Get the variant ID of the item
    let variantId = $(".mini-cart-items .mini-cart-item")
      .eq(itemIndex)
      .find(".variant-id")
      .val();

    // Create the payload to update the cart item
    let payload = {
      updates: {},
    };
    payload.updates[variantId] = newQuantity;

    // Send AJAX request to update cart item quantity
    $.ajax({
      type: "POST",
      url: "/cart/update.js",
      data: payload,
      dataType: "json",
      success: function (data) {
        // Fetch the updated cart information
        $.ajax({
          type: "GET",
          url: "/cart.js",
          dataType: "json",
          success: function (cartData) {
            let updatedItem = cartData.items.find(
              (item) => item.variant_id === variantId
            ); // Find the updated item using variantId
            console.log("variantId:" + variantId);
            let updatedPrice = (updatedItem.price / 100).toFixed(2); // Convert price to readable format

            // Update quantity and price in the mini cart
            $(".mini-cart-items .mini-cart-item")
              .eq(itemIndex)
              .find(".quantity")
              .text(newQuantity);
            $(".mini-cart-items .mini-cart-item")
              .eq(itemIndex)
              .find(".current-product-price")
              .html("<b>Product Price:</b> " + updatedPrice);
          },
          error: function (xhr, ajaxOption, throwError) {
            console.log("Error fetching updated cart information");
          },
        });
      },
      error: function (xhr, ajaxOption, throwError) {
        console.log("Error updating cart item quantity");
      },
    });
  }

  // Close mini cart on close button click
  $(".close-mini-cart").on("click", function () {
    $(".mini-cart-popup").fadeOut();
  });
});
