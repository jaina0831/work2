// src/data/animals.js  動物圖片資料ting

import cat1 from "../assets/cat1.jpg";
import cat2 from "../assets/cat2.jpg";
import cat3 from "../assets/cat3.jpg";
import dog4 from "../assets/dog4.jpg";
import dog5 from "../assets/dog5.jpg";
import cat6 from "../assets/cat6.jpg";
import dog7 from "../assets/dog7.png";
import dog8 from "../assets/dog8.jpg";
import dog9 from "../assets/dog9.jpg";
import cat10 from "../assets/cat10.jpg";
import cat11 from "../assets/cat11.jpg";
import dog12 from "../assets/dog12.jpg";
import dog13 from "../assets/dog13.jpg";
import cat14 from "../assets/cat14.jpg";
import dog15 from "../assets/dog15.jpg";
import rb16 from "../assets/rb16.jpg";
import bird17 from "../assets/bird17.jpg";
import m18 from "../assets/m18.jpg";


export const animalsData = [
  {
    id: 1,
    name: "小橘",
    age: 2,
    gender: "公",
    breed: "米克斯",
    category: "cat", // 🐱
    neutered: true, // ✅ 已結紮
    description: "小橘是溫柔貼心的貓貓，一開始會高冷比較不親人，熟了看你心情不好會來安慰你。",
    image: cat1,
  },
  {
    id: 2,
    name: "雪球",
    age: 3,
    gender: "母",
    breed: "布偶貓",
    category: "cat", // 🐱
    neutered: true, // ✅ 已結紮
    description: "雪球溫柔又愛撒嬌，最喜歡窩在毯子上睡覺。",
    image: cat2,
  },
  {
    id: 3,
    name: "黑豆",
    age: 1,
    gender: "公",
    breed: "黑貓",
    category: "cat", // 🐱
    neutered: false, // ❌ 未結紮
    description: "黑豆有點害羞，但熟了以後就會跟你討抱抱，最喜歡用小奶貓聲音貓貓叫。",
    image: cat3,
  },
  { 
    id: 4, 
    name: "旺旺", 
    age: 2, 
    gender: "公", 
    breed: "臘腸犬",
    category: "dog", // 🐱
    neutered: false, // ❌ 未結紮
    description: "旺旺個性比較害羞慢熟，認識之後會很喜歡旺旺叫跟你講話",
    image: dog4 
  },
  { 
    id: 5, 
    name: "花花", 
    age: 6, 
    gender: "母", 
    breed: "英國可卡犬",
    category: "dog", // 🐱
    neutered: true, // ✅ 已結紮
    description: "花花很穩重成熟很乖，喜歡跟人互動",
    image: dog5 
  },
  { 
    id: 6, 
    name: "灰紋", 
    age: 2, 
    gender: "公", 
    breed: "虎斑貓",
    category: "cat", // 🐱
    neutered: true, // ✅ 已結紮
    description: "灰紋喜歡調皮搗蛋，擅長跑來跑去抓小動物",
    image: cat6, 
  },
  {
    id: 7,
    name: "球球",
    age: 3,
    gender: "母",
    breed: "拉布拉多",
    category: "dog", // 🐶
    neutered: false, // ❌ 未結紮
    description: "球球是一隻活潑親人的狗狗，喜歡曬太陽和被摸摸",
    image: dog7,
  },
  {
    id: 8,
    name: "憨憨",
    age: 5,
    gender: "公",
    breed: "法國鬥牛犬",
    category: "dog", // 🐶
    neutered: true, // ✅ 已結紮
    description: "阿呆個性憨厚，愛吃又愛睡，是個可愛的小肉球。適合喜歡安靜陪伴的人。",
    image: dog8,
  },
  {
    id: 9,
    name: "小黑",
    age: 1,
    gender: "母",
    breed: "邊境牧羊犬",
    category: "dog", // 🐶
    neutered: false, // ❌ 未結紮
    description: "小黑非常聰明活潑，需要大量的運動和智力刺激，非常適合愛好戶外活動的家庭。",
    image: dog9,
  },
  {
    id: 10,
    name: "咪嚕",
    age: 4,
    gender: "母",
    breed: "異國短毛貓",
    category: "cat", // 🐱
    neutered: true, // ✅ 已結紮
    description: "咪嚕長相可愛，是萌萌的加菲貓，但個性有點像小公主，喜歡被服侍，但非常愛乾淨。",
    image: cat10,
  },
  {
    id: 11,
    name: "波波",
    age: 1, // 小於一歲
    gender: "公",
    breed: "挪威森林貓",
    category: "cat", // 🐱
    neutered: false, // ❌ 未結紮
    description: "波波是隻年輕公貓，好奇心重，精力旺盛，毛髮濃密，喜歡爬高。",
    image: cat11,
  },
  {
    id: 12,
    name: "斑斑",
    age: 7,
    gender: "母",
    breed: "吉娃娃",
    category: "dog", // 🐶
    neutered: true, // ✅ 已結紮
    description: "斑斑年紀較大，性格穩定，需要一個溫暖安靜的家度過晚年。",
    image: dog12,
  },
  {
    id: 13,
    name: "雷格",
    age: 2,
    gender: "公",
    breed: "德國牧羊犬",
    category: "dog", // 🐶
    neutered: true, // ✅ 已結紮
    description: "雷格體型健壯，非常忠誠且警惕性高，適合有訓練經驗的飼主。",
    image: dog13,
  },
  {
    id: 14,
    name: "巧克",
    age: 3,
    gender: "公",
    breed: "蘇格蘭折耳貓",
    category: "cat", // 🐱
    neutered: true, // ✅ 已結紮
    description: "巧克性格安靜溫順，喜歡被人抱著，但要注意其關節健康。",
    image:cat14,
  },
  {
    id: 15,
    name: "小白",
    age: 1,
    gender: "母",
    breed: "博美犬",
    category: "dog", // 🐶
    neutered: false, // ❌ 未結紮
    description: "小白毛茸茸像一團棉花糖，叫聲甜美，但換毛期需要勤於梳理。",
    image: dog15,
  },
  {
    id: 16,
    name: "胖丁",
    age: 1,
    gender: "公",
    breed: "垂耳兔",
    category: "rabbit", // 🐰 兔子
    neutered: true, // ✅ 已結紮
    description: "胖丁個性溫和親人，喜歡在地上跳躍，但對聲音比較敏感，需要安靜的環境。",
    image: rb16,
  },
  {
    id: 17,
    name: "奇奇",
    age: 4,
    gender: "母",
    breed: "虎皮鸚鵡",
    category: "bird", // 🐦 鳥類
    neutered: false, // ❌ 不適用 (或保持 false)
    description: "奇奇是一隻愛說話的鸚鵡，每天早上會用清脆的聲音叫醒主人，需要經常放風與互動。",
    image: bird17,
  },
  {
    id: 18,
    name: "小麥",
    age: 0, // 幾個月大
    gender: "公",
    breed: "黃金鼠",
    category: "small_pet", // 🐹 小型寵物
    neutered: false, // ❌ 不適用 (或保持 false)
    description: "小麥非常愛跑滾輪，精力充沛，屬於夜行性動物，適合喜歡晚間陪伴的飼主。",
    image: m18,
  },
];