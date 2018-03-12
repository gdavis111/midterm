
// *----------------------------*
// | DISPLAYING SERVERSIDE DATA |
// *----------------------------*

const renderMenu = (menu) => {
  let current_category   = menu[0].category;
  let $category          = $(`<div class="${current_category}"></div>`);
  const $menu            = $('#menu');
  $menu.empty();
  $category.append(`<h3 class="foodNameH3">${current_category}</h3>`);

  for(let product of menu) {
    if(current_category != product.category) {
      $menu.append($category);
      current_category = product.category;
      $category = $(`<div class="${current_category}"></div>`);
      $category.append(`<h3 class="foodNameH3">${current_category}</h3>`);
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
  const printHTML = (cart) => {
    let total = 0;
    for(let product_id in cart) {
      let qty          = cart[product_id].qty;
      let product      = JSON.parse(cart[product_id].json);
      let price_sum    = product.price * qty;
      total += price_sum;

      let $product = $(`
        <div class="cart_item" data-id="${product_id}">
          <small class="three">${qty}</small>
          <span>${product.name}</span>
          <small class="price_sum">$${price_sum}</small>
        </div>
      `);

      $cart.append($product);
    }

    $cart.append(`<span class="total">TOTAL       $${total}</span>`);
    $cart.append('<button id="order">Place Order</button>');

    $('.cart_item').on('click', removeThisFromCart);
    $('#order').on('click', placeOrderHandler);
  };

  $cart.empty();
  $cart.append('<h3>Your Cart:</h3>');

  if($.isEmptyObject(cart)) {
    const returning_cart = $cart.data('json');
    $cart.data('json', '');

    if(!$.isEmptyObject(returning_cart)) {
      printHTML(returning_cart);
    }
    else {
      $cart.append('<p>Your cart is empty. Click on the menu items to add to your cart.');
    }
  }
  else {
    printHTML(cart);
  }
};

function renderOrders() {
  const $orders   = $('#orders');
  const orders    = $orders.data('orders');

  $orders.empty();

  for(let order of orders) {

    let $order = $(`
      <section class="orderDisplay">
        <h3>Order ID: ${order.id}</h3>
      </section>
    `);
    for(let item of order.items) {
      $order.append(`
        <p><span>${item.quantity}X</span><span>${item.name}</span><span>$${item.price_sum}</span></p>
      `);
    }
    $order.append(`<strong>Total:</strong><strong>$${order.total}</strong>`);
    $order.append(`<p>${order.status}</p>`);
    $orders.append($order);
  }
}

// *-------------------------*
// | CLICK AND FORM HANDLERS |
// *-------------------------*

// Cart Related...

function placeOrder() {
  $.ajax({
    method: "POST",
    url: "/orders"
  })
  .done(() => {
    window.location.replace('/orders');
  });
}

function placeOrderHandler(event) {
  event.stopImmediatePropagation();
  if(!$('nav').data('logged-in')) {
    displayLoginFormAsync()
    .then((user_logged_in) => {
      if(user_logged_in) {
        placeOrder();
      }
    });
  }
  else {
    placeOrder();
  }
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
    method: "PUT",
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
  const $name            = $quantity_form.find('.name');
  const $qty             = $quantity_form.find('.qty');
  const $plus            = $quantity_form.find('.plus');
  const $minus           = $quantity_form.find('.minus');
  const $add             = $quantity_form.find('.add');
  const $cancel          = $quantity_form.find('.cancel');
  const product_json     = $(this).data('product_json');
  const name             = JSON.parse(product_json).name;
  const clear            = () => {
    $plus.off('click');
    $minus.off('click');
    $add.off('click');
    $cancel.off('click');
  };
  const exit             = () => {
    clear();
    $quantity_form.fadeOut();
  };

  clear();

  $name.text(name);
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

// Authentication Related...

function logoutButtonHandler() {
  $.ajax({
    method: "PUT",
    url: "/users/logout"
  })
  .done(() => window.location.replace("/"));
}

function loginHandler(event, callback=null) {
  displayLoginFormAsync()
    .then((user_logged_in) => {
      if(user_logged_in && callback) {
        callback();
      }
    });
}

function formSubmissionHandler(event, route, exit, resolve) {

  event.preventDefault();
  $.ajax({
    method: "PUT",
    url: route,
    data: $(this).serialize()
  })
  .done((username_and_id) => {
    exit();
    $('#username')
      .data('id', username_and_id.id)
      .text(username_and_id.username);
    $('nav').data('logged-in', true);
    reflectLoginStatus();
    resolve(true);
  })
  .fail((err) => {
    $.each($('.error_message'), function(key, elem) {
      if($(elem).closest('article').css('display') !== 'none') {
        $(elem).html(err.responseText);
      }
    });
  });
}

function exitForm($section, $form, jElements, clickAway) {
  $form.off('submit');
  for(let j of jElements) {
    j.off('click');
  }
  window.removeEventListener('click', clickAway, true);
  $section.hide();
}

function clickAwayLogin(event) {
  if(!$.contains(document.getElementById('login'), event.target)) {
    event.stopPropagation();
    const $login_section       = $('#login');
    const $form                = $login_section.find('form');
    const $registration_link   = $login_section.find('#new');
    exitForm($login_section, $form, [$registration_link], clickAwayLogin);
    return false;
  }
}

function clickAwayRegister(event) {
  if(!$.contains(document.getElementById('register'), event.target)) {
    event.stopPropagation();
    const $register_section       = $('#register');
    const $form                = $register_section.find('form');
    exitForm($register_section, $form, [], clickAwayRegister);
    return false;
  }
}

function displayRegistrationFormAsync() {
  return new Promise(function(resolve, reject) {

    const $register_section    = $('#register');
    const $form                = $register_section.find('form');
    const route                = "/users/register";
    const exit                 = () => {
      $form.off('submit');
      window.removeEventListener('click', clickAwayRegister, true);
      $register_section.hide();
    };

    $form.on('submit', function(event) {
      formSubmissionHandler.bind(this)(event, route, exit, resolve);
    });

    window.addEventListener('click', clickAwayRegister, true);
    $register_section.fadeIn();

  });
}

function displayLoginFormAsync() {
  return new Promise(function(resolve, reject) {

    const $login_section       = $('#login');
    const $form                = $login_section.find('form');
    const $registration_link   = $login_section.find('#new');
    const route                = "/users/login/";
    const exit                 = () => {
      $registration_link.off('click');
      $form.off('submit');
      window.removeEventListener('click', clickAwayLogin, true);
      $login_section.hide();
    };

    $registration_link.on('click', function(event) {
      event.stopPropagation();
      exitForm($login_section, $form, [$registration_link], clickAwayLogin);
      displayRegistrationFormAsync()
      .then((result) => resolve(result));
    });

    $form.on('submit', function(event) {
      formSubmissionHandler.bind(this)(event, route, exit, resolve);
    });

    window.addEventListener('click', clickAwayLogin, true); 
    $login_section.fadeIn();
  });
}

// *---------*
// | GENERAL |
// *---------*

function reflectLoginStatus() {
  const $login_button = $('#login_button');
  const $logout_button = $('#logout_button');
  const $view_menu = $('#view_menu');
  const $view_orders = $('#view_orders');

  $login_button.off('click');
  $logout_button.off('click');
  $view_menu.off('click');
  $view_orders.off('click');

  if($('nav').data('logged-in')) {
    $login_button.hide();
    $logout_button.closest('div').show();

    $logout_button.on('click', logoutButtonHandler);
    $view_orders.on('click', (event) => window.location.replace('/orders'));
    $view_menu.on('click', (event) => window.location.replace('/home'));
  }

  else {
    $login_button.show();
    $logout_button.closest('div').hide();

    $login_button.on('click', (event) => {
      loginHandler.bind(this)(event);
    });

    $view_orders.on('click', (event) => {
      loginHandler.bind(this)(event, () => window.location.replace('/orders'));
    });

    $view_menu.on('click', (event) => window.location.replace('/home'));
  }
}

function goHome() {
  $.ajax({
    method: "GET",
    url: "/menu"
  })
  .done((menu) => {
    renderMenu(menu);
    renderCart();
    reflectLoginStatus();
  });
}

function goToOrders() {
  reflectLoginStatus();
  renderOrders();
  setInterval(function() { window.location.replace('/orders'); }, 60000);
}

