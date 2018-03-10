// TODO deal with double-clicking on items being added to cart. This makes the quantity specifier mulitiply
//

// *-----------------------*
// | MENU AND CART DISPLAY |
// *-----------------------*

const renderMenu = (menu) => {
  let current_category   = menu[0].category;
  let $category          = $(`<div class="${current_category}"></div>`);
  const $menu            = $('#menu');
  $menu.empty();
  $category.append(`<h3>${current_category}</h3>`);

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
          <small>$${price_sum}</small>
        </div>
      `);

      $cart.append($product);
    }

    $cart.append(`<span class="total">Total $${total}</span>`);
    $cart.append('<button id="order">Place Order</button>');

    $('.cart_item').on('click', removeThisFromCart);
    $('#order').on('click', placeOrder);
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

// *-------------------------*
// | CLICK AND FORM HANDLERS |
// *-------------------------*

function placeOrder(event) {
  event.stopImmediatePropagation();
  if(!$('nav').data('logged-in')) {
    displayLoginFormAsync()
    .then((user_logged_in) => {
      if(user_logged_in) {
        alert('now we will place your order');
      }
    })
    .catch((message) => {
      alert(message);
    });
  }
  else {
    // TODO write this function. Talk to Greg about Twilio
    alert('This is where we do the twilio call and access the database to create an order row in the orders table');
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


function logoutButtonHandler() {
  $.ajax({
    method: "PUT",
    url: "/users/logout"
  })
  .done(() => window.location.replace("/"));
}

function loginButtonHander(event, callback) {
  event.stopImmediatePropagation();
  displayLoginFormAsync()
    .then((user_logged_in) => {
      if(user_logged_in) {
        callback();
      }
    })
    .catch((message) => {
      // TODO you can do better than alert...
      alert(message);
    });
}

function formSubmissionHandler(event, route, exit, resolve, reject) {

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
    resolve(true);
  })
  .fail((message) => {
    exit();
    reject(message);
  });
}



function displayRegistrationFormAsync() {
  return new Promise(function(resolve, reject) {

    function windowClick() {
      exit();
      resolve(false);
    }

    const $register_section    = $('#register');
    const $form                = $register_section.find('form');
    const route                = "/users/register";
    const exit                 = () => {
      $form.off('submit');
      $register_section.off('click');
      window.removeEventListener('click', windowClick);
      $register_section.hide();
    };

    $form.on('submit', function(event) {
      formSubmissionHandler.bind(this)(event, route, exit, resolve, reject);
    });

    $register_section.on('click', function(event) {
      event.stopPropagation();
    });
    window.addEventListener('click', windowClick, true);


    $register_section.fadeIn();

  });
}

function displayLoginFormAsync() {
  return new Promise(function(resolve, reject) {

    // debugger;

    const $login_section       = $('#login');
    const $form                = $login_section.find('form');
    const $registration_link   = $login_section.find('#new');
    const route                = "/users/login/";
    const exit                 = () => {
      $registration_link.off('click');
      $form.off('submit');
      $login_section.off('click');
      $('window').off('click');
      $login_section.hide();
    };

    $registration_link.on('click', function(event) {
      event.stopImmediatePropagation();
      exit();
      displayRegistrationFormAsync()
      .then((status) => resolve(status));
    });

    $form.on('submit', function(event) {
      formSubmissionHandler.bind(this)(event, route, exit, resolve, reject);
    });

    $login_section.on('click', function(event){
      event.stopPropagation();
    });

    $(window).on('click', function() {
      exit();
      resolve(false);

    });

    $login_section.fadeIn();
  });
}

// *---------*
// | GENERAL |
// *---------*

function reflectLoginStatus() {
  const logged_in = $('nav').data('logged-in');

  if(logged_in) {
    $('#login_button').hide();
    $('nav').find('#logout_button').closest('div').show();

    $('#logout_button').on('click', logoutButtonHandler);
  }

  else {
    $('#login_button').show();
    $('nav').find('#logout_button').closest('div').hide();

    $('#login_button').on('click', (event) => {
      loginButtonHander.bind(this)(event, reflectLoginStatus);
    });

    $('#view_orders').on('click', (event) => {
      loginButtonHander.bind(this)(event, () => window.location.replace('/orders'));
    });

  }
}


$(() => {

  $.ajax({
    method: "GET",
    url: "/menu"
  })
  .done((menu) => {
    renderMenu(menu);
    renderCart();
    reflectLoginStatus();
  });

});
