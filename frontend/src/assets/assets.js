import basket_icon from './basket_icon.png'
import logo from './FoodOrder.png'
import header_img from './header_img.png'
import search_icon from './search_icon.png'

import menu_1 from './menu_1.png'
import menu_2 from './menu_2.png'
import menu_3 from './menu_3.png'
import menu_4 from './menu_4.png'
import menu_5 from './menu_5.png'
import menu_6 from './menu_6.png'
import menu_7 from './menu_7.png'

import food_1 from './food_1.png'
import food_2 from './food_2.png'
import food_3 from './food_3.png'
import food_4 from './food_4.png'
import food_5 from './food_5.png'
import food_6 from './food_6.png'
import food_7 from './food_7.png'
import food_8 from './food_8.png'
// Nếu bạn có thêm ảnh food_9 (Spaghetti) thì nhớ import ở đây:
// import food_9 from './food_9.png' 

import add_icon_white from './add_icon_white.png'
import add_icon_green from './add_icon_green.png'
import remove_icon_red from './remove_icon_red.png'
import app_store from './app_store.png'
import play_store from './play_store.png'
import linkedin_icon from './linkedin_icon.png'
import facebook_icon from './facebook_icon.png'
import twitter_icon from './twitter_icon.png'
import cross_icon from './cross_icon.png'
import selector_icon from './selector_icon.png'
import rating_starts from './rating_starts.png'
import profile_icon from './profile_icon.png'
import bag_icon from './bag_icon.png'
import logout_icon from './logout_icon.png'
import parcel_icon from './parcel_icon.png'

export const assets = {
    logo,
    basket_icon,
    header_img,
    search_icon,
    rating_starts,
    add_icon_green,
    add_icon_white,
    remove_icon_red,
    app_store,
    play_store,
    linkedin_icon,
    facebook_icon,
    twitter_icon,
    cross_icon,
    selector_icon,
    profile_icon,
    logout_icon,
    bag_icon,
    parcel_icon
}

export const menu_list = [
    {
        menu_name: "Fried Chicken",
        menu_image: menu_1 
    },
    {
        menu_name: "Roasted Chicken",
        menu_image: menu_2
    },
    {
        menu_name: "Combos",
        menu_image: menu_3
    },
    {
        menu_name: "Sides",
        menu_image: menu_4
    },
    {
        menu_name: "Beverages",
        menu_image: menu_5
    },
    {
        menu_name: "Pasta",
        menu_image: menu_6
    },
    {
        menu_name: "Burger",
        menu_image: menu_7
    }
]

export const food_list = [
    {
        _id: "1",
        name: "Crispy Spicy Fried Chicken",
        image: food_1, 
        price: 3,
        description: "Crispy fried chicken coated in spicy chili, featuring a thin crust and juicy, tender meat.",
        category: "Fried Chicken"
    },
    {
        _id: "2",
        name: "Cheesy Fried Chicken",
        image: food_2,
        price: 4,
        description: "Crispy fried chicken thoroughly coated in a rich, savory, and aromatic cheese sauce.",
        category: "Fried Chicken"
    },
    {
        _id: "3",
        name: "Honey Roasted Chicken (Half)",
        image: food_3,
        price: 9,
        description: "Classic roasted chicken glazed with rich honey, featuring a beautiful golden skin.",
        category: "Roasted Chicken"
    },
    {
        _id: "4",
        name: "Black Pepper Roasted Chicken",
        image: food_4,
        price: 10,
        description: "Juicy roasted chicken smothered in a spicy black pepper sauce to awaken your taste buds.",
        category: "Roasted Chicken"
    },
    {
        _id: "5",
        name: "Value Student Combo",
        image: food_5,
        price: 5,
        description: "1 pc Fried Chicken + 1 Medium French Fries + 1 Chilled Pepsi.",
        category: "Combos"
    },
    {
        _id: "6",
        name: "Family Combo (Medium)",
        image: food_6,
        price: 15,
        description: "4 pcs Fried Chicken + 1 Coleslaw + 2 French Fries + 3 Soft Drinks.",
        category: "Combos"
    },
    {
        _id: "7",
        name: "Cheese Shaker Fries",
        image: food_7,
        price: 2,
        description: "Golden crispy french fries tossed in a sweet and savory cheese powder.",
        category: "Sides"
    },
    {
        _id: "8",
        name: "Crispy Zinger Burger",
        image: food_8,
        price: 4,
        description: "Burger with a crispy fried chicken patty, fresh lettuce, and creamy mayonnaise.",
        category: "Sides"
    }
]