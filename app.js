//  variables
const cartBtn = document.querySelector('.cart-btn');
const closeCartBtn = document.querySelector('.close-cart');
const clearCartBtn = document.querySelector('.clear-cart');
const cartDom = document.querySelector('.cart');
const cartOverlay = document.querySelector('.cart-overlay');
const cartItems = document.querySelector('.cart-items');
const cartTotal = document.querySelector('.cart-total');
const cartContent = document.querySelector('.cart-content');
const productsDom = document.querySelector('.products-center');

// cart
let cart = [];
// buttons
let buttonsDom = [];
//  getting the products
class Products {
  async getAllProducts() {
    try {
      let result = await fetch('products.json');
      let data = await result.json();
      let products = data.items;
      products = products.map((item) => {
        const { title, price } = item.fields;
        const { id } = item.sys;
        const image = item.fields.image.fields.file.url;
        return { title, price, id, image };
      });
      return products;
    } catch (err) {
      console.log(err);
    }
  }
}

//  display the products
class UI {
  displayProducts(products) {
    let result = '';
    products.forEach((item) => {
      result += `
     <article class="product">
          <div class="img-container">
            <img src=${item.image} alt=${item.title} class="product-img" />
            <button class="bag-btn" data-id=${item.id}>
              <i class="fas fa-shopping-cart"></i>
              add to bag
            </button>
          </div>
          <h3>${item.title}</h3>
          <h4>$${item.price}</h4>
        </article>`;
    });
    productsDom.innerHTML = result;
  }
  getBagButtons() {
    const btns = [...document.querySelectorAll('.bag-btn')];
    buttonsDom = btns;
    btns.forEach((btn) => {
      let id = btn.dataset.id;
      let inCart = cart.find((item) => {
        item.id === id;
      });
      if (inCart) {
        btn.textContent = 'In Cart';
        btn.disabled = true;
      } else {
        btn.addEventListener('click', (e) => {
          e.target.innerText = 'In Cart';
          e.target.disabled = true;

          //  get product from products
          let cartItem = { ...Storage.getProduct(id), amount: 1 };

          // add product to the cart
          cart = [...cart, cartItem];

          //  save cart in local storage
          Storage.saveCart(cart);

          //  set cart values
          this.setCartValues(cart);

          // display cart item
          this.addCartItem(cartItem);

          //  show the cart
          this.showCart();
        });
      }
    });
  }
  setCartValues(cart) {
    let tempTotal = 0;
    let itemsTotal = 0;
    cart.map((item) => {
      tempTotal += item.price * item.amount;
      itemsTotal += item.amount;
    });

    cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
    cartItems.innerText = itemsTotal;
  }
  addCartItem(cartItem) {
    const div = document.createElement('div');
    div.classList.add('cart-item');
    div.innerHTML = `   <img src=${cartItem.image} alt=${cartItem.title} />
            <div>
              <h4>${cartItem.title}</h4>
              <h5>$${cartItem.price}</h5>
              <span class="remove-item" data-id=${cartItem.id}>Remove</span>
            </div>
            <div style="
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-direction: column;">
              <i class="fas fa-chevron-up" data-id=${cartItem.id}><p class="item-amount">${cartItem.amount}</p></i>
                    <i class="fas fa-chevron-down" data-id=${cartItem.id}><p class="item-amount"></p></i>
            </div>`;
    cartContent.appendChild(div);
  }
  showCart() {
    cartOverlay.classList.add('transparentBcg');
    cartDom.classList.add('showCart');
  }
  setupApp() {
    cart = Storage.getCart();
    this.setCartValues(cart);
    this.populateCart(cart);
    cartBtn.addEventListener('click', this.showCart);
    closeCartBtn.addEventListener('click', this.hideCart);
  }
  populateCart(cart) {
    cart.forEach((item) => {
      this.addCartItem(item);
    });
  }
  hideCart() {
    cartOverlay.classList.remove('transparentBcg');
    cartDom.classList.remove('showCart');
  }
  cartLogic() {
    // clear cart button
    clearCartBtn.addEventListener('click', () => {
      this.clearCart();
    });
    // cart functionality
    cartContent.addEventListener('click', (e) => {
      if (e.target.classList.contains('remove-item')) {
        let removedItem = e.target;
        let id = removedItem.dataset.id;
        cartContent.removeChild(removedItem.parentElement.parentElement);
        this.removeItem(id);
      } else if (e.target.classList.contains('fa-chevron-up')) {
        let addAmount = e.target;
        let id = addAmount.dataset.id;
        let tempItem = cart.find((item) => item.id === id);
        tempItem.amount += 1;
        Storage.saveCart(cart);
        this.setCartValues(cart);
        addAmount.nextElementSibling.innerText = tempItem.amount;
      } else if (e.target.classList.contains('fa-chevron-down')) {
        let lowerAmount = e.target;
        let id = lowerAmount.dataset.id;
        let tempItem = cart.find((item) => item.id === id);
        tempItem.amount -= 1;
        if (tempItem.amount > 0) {
          Storage.saveCart(cart);
          this.setCartValues(cart);
          lowerAmount.previousElementSibling.innerText = tempItem.amount;
        } else {
          cartContent.removeChild(lowerAmount.parentElement.parentElement);
          this.removeItem(id);
        }
      }
    });
  }
  clearCart() {
    let cartItems = cart.map((item) => item.id);
    cartItems.forEach((id) => this.removeItem(id));
    while (cartContent.children.length > 0) {
      cartContent.removeChild(cartContent.children[0]);
    }
    this.hideCart();
  }
  removeItem(id) {
    cart = cart.filter((item) => item.id !== id);
    this.setCartValues(cart);
    Storage.saveCart(cart);
    let button = this.getSingleButton(id);
    button.disabled = false;
    button.innerHTML = `<i class="fas fa-shopping-cart"></i>add to cart`;
  }
  getSingleButton(id) {
    return buttonsDom.find((btn) => btn.dataset.id === id);
  }
}

//  local storage
class Storage {
  static saveProducts(products) {
    localStorage.setItem('products', JSON.stringify(products));
  }
  static getProduct(id) {
    let products = JSON.parse(localStorage.getItem('products'));
    return products.find((product) => product.id === id);
  }
  static saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
  }
  static getCart() {
    return localStorage.getItem('cart')
      ? JSON.parse(localStorage.getItem('cart'))
      : [];
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const products = new Products();
  const ui = new UI();
  // setup app
  ui.setupApp();
  products
    .getAllProducts(products)
    .then((products) => {
      ui.displayProducts(products);
      Storage.saveProducts(products); // saving the products in the local storage
    })
    .then(() => {
      ui.getBagButtons();
      ui.cartLogic();
    });

  // getting all the products method
});
