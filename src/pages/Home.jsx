import styles from "./Home.module.css";
import React, { useState } from 'react'; // 1. 引入 useState
import { Carousel, Button, Modal, Rate, Tag } from 'antd'; // 從 antd 引入 Carousel 元件
import { Link } from 'react-router-dom';
import coffeeIcon from "../assets/coffeeIcon.png";
import Carouse01 from "../assets/Carouse01.png";
import Carouse02 from "../assets/Carouse02.png";
import Carouse03 from "../assets/Carouse03.png";


import bookIcon from "../assets/bookIcon.png";
import catIcon from "../assets/catIcon.png";
import catcafe01 from "../assets/catcafe01.jpg";
import catcafe01_1 from "../assets/catcafe01_1.jpg";
import catcafe01_2 from "../assets/catcafe01_2.jpg";
import catcafe02 from "../assets/catcafe02.jpg";
import catcafe02_1 from "../assets/catcafe02_1.jpg";
import catcafe02_2 from "../assets/catcafe02_2.jpg";
import AnimalCard from "../components/AnimalCard";
import { animalsData } from "../data/animals";

export default function Home() {

  // 3. 定義彈窗狀態與選中資料的狀態
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCafe, setSelectedCafe] = useState(null);

  // 4. 定義咖啡廳資料 (確保剛好就是這兩間)
  const cafeList = [
   {
      id: 1,
      name: "転運棧-貓咪中途咖啡廳",
      address: "臺北市大同區天水路2-3號",
      img: catcafe01,
      link: "https://www.facebook.com/profile.php?id=100093700315941",
      rating: 4.8, // Google 評分
      reviewCount: 1250, // 評論數
      tags: ["寵物友善", "有插座", "不限時"],
      // 這裡可以放入更多相關相片
      gallery: [catcafe01, catcafe01_1, catcafe01_2], 
      description: "這是一個溫馨的貓咪中途空間，提供咖啡與美味餐點，讓你在放鬆的同時也能與待領養的貓咪們相遇。"
    },
   {
      id: 2,
      name: "FUFUCatCafe",
      address: "臺北市萬華區武昌街二段53號3樓",
      img: catcafe02,
      link: "https://www.facebook.com/FUFUCatCafe",
      rating: 4.5,
      reviewCount: 890,
      tags: ["西門町熱點", "貓咪超多", "需預約"],
      gallery: [catcafe02, catcafe02_1, catcafe02_2],
      description: "位於西門町的高人氣貓咪咖啡廳，環境寬敞整潔，擁有多隻可愛活潑的店貓陪伴。"
    }
  ];

  // 5. 處理點擊事件
  const handleCafeClick = (cafe) => {
    setSelectedCafe(cafe);
    setIsModalOpen(true);
  };

  return (
    <div className={styles.container}>
      <div className={styles.CarouselboxContainer}>
        <Carousel arrows infinite={false}>
          <div className={styles.Carouselbox}>
            <img src={Carouse01} alt="可愛橘貓" className="w-full h-full object-cover rounded-xl"/>
          </div>
          <div className={styles.Carouselbox}>
            <img src={Carouse02} alt="緬因幼貓" className="w-full h-full object-cover rounded-xl"/>

          </div>
          <div className={styles.Carouselbox}>
            <img src={Carouse03} alt="黑貓睡覺" className="w-full h-full object-cover rounded-xl"/>

          </div>
       </Carousel>
      </div>
      <div className={styles.titletext}>
          <h1>網站主要服務項目</h1>
      </div> 
      <div className={styles.CoreServiceArea}>
        {/* 第一個功能：中途咖啡廳 */}
        <div className={styles.ServicesArea}>
          <div className={styles.cardLinkReset}> {/* 保留原有樣式，但現在是純 div */}
            <div className={styles.ServiceIcon}>
              <img src={coffeeIcon} alt="Service1" className="w-full h-full object-cover rounded-xl" />
            </div>
            <p className={styles.Servicetext}>中途咖啡廳推薦</p>
          </div>
        </div>

        {/* 第二個功能：毛孩資訊 */}
        <div className={styles.ServicesArea}>
          <div className={styles.cardLinkReset}>
            <div className={styles.ServiceIcon}>
              <img src={bookIcon} alt="Service2" className="w-full h-full object-cover rounded-xl" />
            </div>
            <p className={styles.Servicetext}>毛孩資訊分享</p>
          </div>
        </div>

        {/* 第三個功能：認養服務 */}
        <div className={styles.ServicesArea}>
          <div className={styles.cardLinkReset}>
            <div className={styles.ServiceIcon}>
              <img src={catIcon} alt="Service3" className="w-full h-full object-cover rounded-xl" />
            </div>
            <p className={styles.Servicetext}>收留/認養浪浪服務</p>
          </div>
        </div>
      </div>
      <div className={styles.AboutSection}>
        <h1 style={{ fontSize: '32px', color: '#43261f', marginBottom: '20px', fontFamily: 'GenSenRounded', fontWeight: 'bold' }}>
          讓每個生命，都有個值得歸屬的終點
        </h1>
        <p style={{ fontSize: '18px', color: '#666', fontStyle: 'italic', marginBottom: '20px' }}>
          「每一次在街角與牠們擦身而過，我們總是在想：除了同情，我們還能多做什麼？」
        </p>

        {/* 使用 CardContainer 包裹卡片，確保在畫面中間 */}
        <div className={styles.CardContainer}>
          {/* 我們的故事 */}
          <div className={styles.ConceptCardCustom}>
            <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#f57c00', marginBottom: '12px', display: 'flex', alignItems: 'center' }}>
              <span style={{ marginRight: '12px' }}>🔍</span> 我們的故事
            </h3>
            <p style={{ fontSize: '18px', color: '#444', lineHeight: '1.6', margin: 0 }}>
              我們是一群熱愛動物的夥伴，我們相信流浪並不是牠們的宿命，而是一個尋找幸福的過程。透過這個平台，我們希望能打破收容所冰冷的門檻，將那些窩在角落、渴望眼神的毛孩，重新帶回大眾的視野。
            </p>
          </div>

          {/* 我們的初衷 */}
          <div className={styles.ConceptCardCustom}>
            <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#f57c00', marginBottom: '12px', display: 'flex', alignItems: 'center' }}>
              <span style={{ marginRight: '12px' }}>✨</span>我們的初衷
            </h3>
            <p style={{ fontSize: '18px', color: '#444', lineHeight: '1.6', margin: 0 }}>
              「領養」不應只是隨機的相遇，而是一場深思熟慮的承諾。我們建立這個空間，是為了讓每一個充滿愛的家庭，都能在這裡遇見那個能讓生命完整的靈魂伴侶。
            </p>
          </div>
        </div>

        <div className={styles.AboutContent} style={{ width: '100%', marginTop: '60px', borderTop: '1px solid #eee', paddingTop: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h1 style={{ fontSize: '32px', color: '#43261f', marginBottom: '20px', fontFamily: 'GenSenRounded', fontWeight: 'bold' }}>
            重新定義流浪，我們正在改變牠們的未來
          </h1>
          <p style={{ fontSize: '17px', lineHeight: '1.8', color: '#444', maxWidth: '800px' }}>
            街頭不應該是牠們的家。我們相信，解決流浪動物問題的關鍵在於<strong>「資訊的流通」</strong>與<strong>「大眾的參與」</strong>。
            <br />
            我們致力於建立一個永續的生態系，連結政府機構、中途咖啡廳以及愛動物的每一位你。
          </p>
            
          {/* 下方三個理念也使用 CardContainer 置中 */}
          <div className={styles.CardContainer}>
            <div className={styles.ConceptCardCustom}>
              <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#f57c00', marginBottom: '12px', display: 'flex', alignItems: 'center' }}>
                <span style={{ marginRight: '12px' }}>🧡</span> 領養代替購買
              </h3>
              <p style={{ fontSize: '18px', color: '#444', lineHeight: '1.6', margin: 0 }}>
                讓被遺棄的生命擁有第二次機會，用愛終止繁殖場的循環，給予牠們一個真正的家。
              </p>
            </div>

            <div className={styles.ConceptCardCustom}>
              <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#f57c00', marginBottom: '12px', display: 'flex', alignItems: 'center' }}>
                <span style={{ marginRight: '12px' }}>☕</span> 中途支持
              </h3>
              <p style={{ fontSize: '18px', color: '#444', lineHeight: '1.6', margin: 0 }}>
                推廣「先相處再領養」的概念，透過中途咖啡廳的互動空間，建立更深厚且穩固的領養關係。
              </p>
            </div>

            <div className={styles.ConceptCardCustom}>
              <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#f57c00', marginBottom: '12px', display: 'flex', alignItems: 'center' }}>
                <span style={{ marginRight: '12px' }}>🤝</span> 社群共好
              </h3>
              <p style={{ fontSize: '18px', color: '#444', lineHeight: '1.6', margin: 0 }}>
                每一位使用者的點擊與分享，都是推動改變的力量。讓每個人都能輕鬆參與，共同改善流浪動物的生存環境。
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 改成report頁的排版 */}
      <div className={styles.AdoptionInformationArea}>
        <div className={styles.titletext}>
          <h1>待養資訊</h1>
        </div> 

        {/* 使用與 Report 頁面相似的 Grid 佈局 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-3">
          {animalsData.slice(0, 4).map((animal) => (
            <Link key={animal.id} to={`/Report/${animal.id}`} className={styles.cardLinkReset}>
              <AnimalCard animal={animal} />
            </Link>
          ))}
        </div>

        <div className={styles.AdoptionButtonArea}>
          <Button type="primary" href="/Report" className={styles.Button}>查看更多代養資訊</Button>
        </div>
      </div>

      {/* 5. 修改人氣咖啡廳推薦區塊 */}
      <div className={styles.CafeRecommendationArea}>
        <div className={styles.titletext}>
          <h1>人氣咖啡廳推薦</h1>
        </div> 
        <div className={styles.CafeArea}>
          {cafeList.map((cafe) => (
            <div 
              key={cafe.id} 
              className={styles.cardLinkReset} 
              onClick={() => handleCafeClick(cafe)}
              style={{ cursor: 'pointer' }} 
            >
              <div className={styles.CafesInformationBox}>
                <div className={styles.cafesimg}>
                  <img src={cafe.img} alt={cafe.name} />
                </div>
                <div className={styles.cafestext}>
                  <h2>{cafe.name}</h2>
                  <p>地址：{cafe.address}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className={styles.CafeButtonArea}>
          <Button type="primary" href="/Map" className={styles.Button}>查看更多咖啡廳</Button>
        </div>
      </div>

      {/* 6. 彈跳視窗組件 (Modal) */}
      <Modal
        title={
          <span style={{ fontSize: '28px',fontFamily: 'GenSenRounded', fontWeight: 'bold', color: '#333' }}>
            {selectedCafe?.name}
          </span>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        width={700} // 加寬一點以便容納更多資訊
        style={{ top: 20 }}
        footer={[
          <Button key="close" onClick={() => setIsModalOpen(false)}>關閉</Button>,
          <Button key="visit" type="primary" href={selectedCafe?.link} target="_blank">前往官方粉專</Button>
        ]}
      >
        {selectedCafe && (
          <div>
            {/* 相簿輪播圖 */}
            <Carousel autoplay style={{ marginBottom: '10px' }}>
              {selectedCafe.gallery.map((pic, index) => (
                <div key={index}>
                  <img 
                    src={pic} 
                    alt={`gallery-${index}`} 
                    style={{ width: '100%', height: '460px', objectFit: 'cover', borderRadius: '12px' }} 
                  />
                </div>
              ))}
            </Carousel>

            <div style={{ padding: '0 20px' }}>
              {/* 評分區域 - 加大數字與星星 */}
              <div style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                <span style={{ fontSize: '25px', fontWeight: 'bold', color: '#faad14' }}>
                  {selectedCafe.rating}
                </span>
                {/* 使用 transform 縮放星星大小 */}
                <div style={{ transform: 'scale(1.2)', originX: 0 }}>
                  <Rate disabled allowHalf defaultValue={selectedCafe.rating} />
                </div>
                <span style={{ fontSize: '18px', color: '#8c8c8c', marginLeft: '20px' }}>
                  ({selectedCafe.reviewCount} 則 Google 評論)
                </span>
              </div>

              {/* 標籤區域 - 加大標籤 */}
              <div style={{ marginBottom: '20px' }}>
                {selectedCafe.tags.map(tag => (
                  <Tag color="orange" key={tag} style={{ fontSize: '16px', padding: '5px 10px' }}>
                    {tag}
                  </Tag>
                ))}
              </div>

             {/* 內容區塊 - 字體全面加大 */}
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', borderLeft: '6px solid #f57c00', paddingLeft: '10px', marginBottom: '5px' }}>
                商店地址
              </h3>
              <p style={{ fontSize: '16px', marginLeft: '18px', marginBottom: '25px', color: '#333' }}>
                {selectedCafe.address}
              </p>

              <h3 style={{ fontSize: '20px', fontWeight: 'bold', borderLeft: '6px solid #f57c00', paddingLeft: '10px', marginBottom: '5px' }}>
                關於我們
              </h3>
              <p style={{ fontSize: '16px', marginLeft: '18px', lineHeight: '1.5', color: '#444' }}>
                {selectedCafe.description}
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}