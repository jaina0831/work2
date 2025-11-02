import styles from "./Home.module.css";
import { Carousel, Button } from 'antd'; // 從 antd 引入 Carousel 元件
import { Link } from 'react-router-dom';
import coffeeIcon from "../assets/coffeeIcon.png";
import catCarouse01 from "../assets/catCarouse01.jpg";
import catCarouse02 from "../assets/catCarouse02.jpg";
import catCarouse03 from "../assets/catCarouse03.jpg";
import cat01 from "../assets/cat01.png";
import cat02 from "../assets/cat02.jpg";
import cat03 from "../assets/cat03.jpg";
import cat04 from "../assets/cat04.jpg";
import cat05 from "../assets/cat05.jpg";
import bookIcon from "../assets/bookIcon.png";
import catIcon from "../assets/catIcon.png";
import catcafe01 from "../assets/catcafe01.jpg";
import catcafe02 from "../assets/catcafe02.jpg";

export default function Home() {
  return (
    <div className={styles.container}>
      <div className={styles.CarouselboxContainer}>
        <Carousel arrows infinite={false}>
          <div className={styles.Carouselbox}>
            <img src={catCarouse01} alt="可愛橘貓" className="w-full h-full object-cover rounded-xl"/>
          </div>
          <div className={styles.Carouselbox}>
            <img src={catCarouse02} alt="緬因幼貓" className="w-full h-full object-cover rounded-xl"/>

          </div>
          <div className={styles.Carouselbox}>
            <img src={catCarouse03} alt="黑貓睡覺" className="w-full h-full object-cover rounded-xl"/>

          </div>
          <div className={styles.Carouselbox}>
            <img src={cat01} alt="可愛橘貓" className="w-full h-full object-cover rounded-xl"/>
          </div>
       </Carousel>
      </div>
      <div className={styles.CoreServiceArea}>
        <div className={styles.ServicesArea}>
          <Link to="/Map" className={styles.cardLinkReset }>
            <div className={styles.ServiceIcon}>
            <img src={coffeeIcon} alt="Service1" className="w-full h-full object-cover rounded-xl" />
            </div>
            <p className={styles.Servicetext}>中途咖啡廳推薦</p>
          </Link>
          
        </div>
        <div className={styles.ServicesArea}>
          <Link to="/Care" className={styles.cardLinkReset}>
            <div className={styles.ServiceIcon}>
              <img src={bookIcon} alt="Service2" className="w-full h-full object-cover rounded-xl" />
            </div>
            <p className={styles.Servicetext}>貓貓知識分享</p>
          </Link>          
        </div>
        <div className={styles.ServicesArea}>
          <Link to="/Report" className={styles.cardLinkReset}>
            <div className={styles.ServiceIcon}>
              <img src={catIcon} alt="Service3" className="w-full h-full object-cover rounded-xl" />
            </div>
            <p className={styles.Servicetext}>收留/認養貓貓服務</p>
          </Link>
        </div>
      </div>

      <div className={styles.AdoptionInformationArea}>
        <div className={styles.titletext}>
          <h1>待養資訊</h1>
        </div> 
        <div className={styles.AdoptionArea}>
          <div className={styles.catsInformationBox}>
            <div className={styles.catsimg} >
              <img src={cat01} alt="Cat01" className="w-full h-full object-cover rounded-xl" />
            </div>
            <div className={styles.catstext}>
              <p>貓咪名稱 1</p>
              <p>年齡：2歲</p>
              <p>性別：公</p>
            </div>
          </div>
          <div className={styles.catsInformationBox}>
             <div className={styles.catsimg} >
              <img src={cat03} alt="Cat03" className="w-full h-full object-cover rounded-xl" />
            </div>
            <div className={styles.catstext}>
              <p>貓咪名稱 3</p>
              <p>年齡：3歲</p>
              <p>性別：母</p>
            </div>
          </div>
          <div className={styles.catsInformationBox}>
             <div className={styles.catsimg} >
              <img src={cat04} alt="Cat04" className="w-full h-full object-cover rounded-xl" />
            </div>
            <div className={styles.catstext}>
              <p>貓咪名稱 4</p>
              <p>年齡：4歲</p>
              <p>性別：母</p>
            </div>
          </div>
           <div className={styles.catsInformationBox}>
             <div className={styles.catsimg} >
              <img src={cat05} alt="Cat05" className="w-full h-full object-cover rounded-xl" />
            </div>
            <div className={styles.catstext}>
              <p>貓咪名稱 4</p>
              <p>年齡：4歲</p>
              <p>性別：母</p>
            </div>
          </div>
        </div>
        <div className={styles.AdoptionButtonArea}>
          <Button type="primary" href="/Report" className={styles.Button}>查看更多代養資訊</Button>
        </div>
      </div>

      <div className={styles.CafeRecommendationArea}>
        <div className={styles.titletext}>
          <h1>人氣咖啡廳推薦</h1>
        </div> 
        <div className={styles.CafeArea}>
          <Link to="https://www.facebook.com/profile.php?id=100093700315941" target="_blank" className={styles.cardLinkReset }>
           <div className={styles.CafesInformationBox}>
            <div className={styles.cafesimg} >
              <img src={catcafe01} alt="Cafe01" />
            </div>
            <div className={styles.cafestext}>
              <h2>転運棧-貓咪中途咖啡廳</h2>
              <p>地址：臺北市大同區天水路2-3號</p>
            </div>
           </div>
          
          </Link>
          <Link to="" target="_blank" className={styles.cardLinkReset}>
           <div className={styles.CafesInformationBox}>
            <div className={styles.cafesimg} >
              <img src={catcafe02} alt="Cafe02" />
            </div>
            <div className={styles.cafestext}>
              <h2>FUFUCatCafe</h2>
              <p>地址：臺北市萬華區武昌街二段53號3樓</p>
            </div>
           </div>
          </Link>
         
        </div>
        <div className={styles.CafeButtonArea}>
          <Button type="primary" href="/Map" className={styles.Button}>查看更多咖啡廳</Button>
        </div>
      </div>

      <div className={styles.KnowledgeArticleArea}>
        <div className={styles.titletext}>
          <h1>知識文章分享</h1>
        </div> 
        <div className={styles.ArticleArea}>
          <div className={styles.ArticleBox}>
            <div className={styles.Articleimg} >
              <img src={catcafe01} alt="Cafe01" />
            </div>
            <div className={styles.Articletext}>
              <h2>転運棧-貓咪中途咖啡廳</h2>
              <p>地址：臺北市大同區天水路2-3號</p>
            </div>
          </div>
          <div className={styles.ArticleBox}>
            <div className={styles.Articleimg} >
              <img src={catcafe01} alt="Cafe01" />
            </div>
            <div className={styles.Articletext}>
              <h2>転運棧-貓咪中途咖啡廳</h2>
              <p>地址：臺北市大同區天水路2-3號</p>
            </div>
          </div>
          <div className={styles.ArticleBox}>
             <div className={styles.Articleimg} >
              <img src={catcafe01} alt="Cafe01" />
            </div>
            <div className={styles.Articletext}>
              <h2>転運棧-貓咪中途咖啡廳</h2>
              <p>地址：臺北市大同區天水路2-3號</p>
            </div>
          </div>
        </div>
        <div className={styles.ArticleAreaButtonArea}>
          <Button type="primary" href="/Care" className={styles.Button}>查看更多知識文章</Button>
        </div>
      </div>
    </div>
  );
}