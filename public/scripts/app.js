const renderMenu = (menu) => {
  let current_category = menu[0].category;
  let $category = $(`<div class="${current_category}"></div>`);
  const $menu = $('#menu');

  for(let product of menu) {
    if(current_category != product.category) {
      $menu.append($category);
      current_category = product.category;
      $category = $(`<div class="${current_category}"></div>`);
    }
    $category.append(`
      <div class="product" data-product-id="${product.id}">
        <span>${product.name}</span>
        <small>${product.price}</small>
      </div>
    `);
  }

  $menu.append($category);
};

$(() => {

  $.ajax({
    method: "GET",
    url: "/menu"
  }).done((menu) => {
    renderMenu(menu);

  });

});
