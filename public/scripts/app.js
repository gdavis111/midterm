const renderMenu = (menu) => {
  let current_category   = menu[0].category;
  let $category          = $(`<div class="${current_category}"></div>`);
  const $menu            = $('#menu');
  $menu.empty();

  for(let product of menu) {
    if(current_category != product.category) {
      $menu.append($category);
      current_category = product.category;
      $category = $(`<div class="${current_category}"></div>`);
    }
    $product = $(`
      <div class="product">
        <span>${product.name}</span>
        <small>$${product.price}</small>
      </div>
    `);
    $product.data('product_json', JSON.stringify(product));
    $category.append($product);
  }

  $menu.append($category);
  $('.product').on('click', displayQuantityForm);

};

const renderCart = (cart) => {
  const $cart = $('#cart');
  $cart.empty();
  $cart.append('<h3>Your Cart:</h3>');

  if($.isEmptyObject(cart)) {
    $cart.append('<p>Your cart is empty. Click on the menu items to add to your cart.');
  }
  else {
    let total = 0;
    for(let product_id in cart) {
      let qty          = cart[product_id].qty;
      let product      = JSON.parse(cart[product_id].json);
      let price_sum    = product.price * qty;
      total += price_sum;

      let $product = $(`
        <div class="cart_item" data-id="${product_id}">
          <small>${qty}</small>
          <span>${product.name}</span>
          <small>$${price_sum}</small>
        </div>
      `);

      $cart.append($product);
    }

    $cart.append(`<span>Total $${total}</span>`);
    $cart.append('<button id="order">Place Order</button>');

    $('.cart_item').on('click', removeThisFromCart);
    $('#order').on('click', placeOrder);

  }
};

function placeOrder() {
  // TODO write this function. Talk to Greg about Twilio
}

function removeThisFromCart() {
  $.ajax({
    method: "DELETE",
    url: `/cart/${$(this).data('id')}`,
  })
  .done((cart) => {
    renderCart(JSON.parse(cart));
  });
}

function addToCart(product_json, qty) {
  $.ajax({
    method: "POST",
    url: `/cart/${JSON.parse(product_json).id}`,
    data: {
      json: product_json,
      qty: qty
    }
  })
  .done((cart) => {
    renderCart(JSON.parse(cart));
  });
}

function displayQuantityForm() {
  const $quantity_form   = $('#specify_quantity');
  const $qty             = $quantity_form.find('span');
  const $plus            = $quantity_form.find('.plus');
  const $minus           = $quantity_form.find('.minus');
  const $add             = $quantity_form.find('.add');
  const $cancel          = $quantity_form.find('.cancel');
  const product_json     = $(this).data('product_json');
  const exit             = () => {
    $plus.off('click');
    $minus.off('click');
    $add.off('click');
    $cancel.off('click');
    $quantity_form.fadeOut();
  };

  $qty.text(1);

  $plus.on('click', function() {
    let new_qty = Number($qty.text()) + 1;
    $qty.text(new_qty);
  });

  $minus.on('click', function() {
    let new_qty = Number($qty.text()) - 1;
    if(new_qty > 0) {
      $qty.text(new_qty);
    }
  });

  $add.on('click', function() {
    exit();
    addToCart(product_json, Number($qty.text()));
  });

  $cancel.on('click', function() {
    exit();
  });

  $quantity_form.fadeIn();

}

function displayLoginForm() {

}

$(() => {

  $.ajax({
    method: "GET",
    url: "/menu"
  })
  .done((menu) => {
    renderMenu(menu);

    // TODO figure out a smart way to pass external data to this
    // script. i.e renderCart below ought to be able to display the
    // cart of a user who's returning to the page. And we need to know whether
    // or not a user is already logged in! Probably the way to
    // do this is with data attributes.

    renderCart();
    $('#login_button').on('click', displayLoginForm);
  });

});
