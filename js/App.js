class App {
    //생성자 (메소드 생성) / let app = new App(받을 값);
    constructor() {
        this.fundList = [];
        this.fundCnt = 1; //현재 펀드번호

        //private list nav = document.querySelectorAll
        this.nav = document.querySelectorAll("nav a");

        this.nav.forEach(x => {
            x.addEventListener("click", this.changeMenu.bind(this)); //bind: 묶어주다.
        });

        //투자자 리스트
        this.invList = [];

        this.articleList = document.querySelectorAll("article");

        this.loadingMethod = {
            "list": this.loadingList.bind(this),
            "register": this.loadingRegister.bind(this),
            "investor": this.loadingInvestor.bind(this)
        }

        //투자자들을 담는 공간
        this.invContainer = document.querySelector(".inv-list");

        //펀드들을 담는 공간
        this.fundContainer = document.querySelector(".fund-list");

        document.querySelector("#register button").addEventListener("click", this.registerFund.bind(this));

        //디버깅용 펀드 데이터
        this.fundList.push(new Fund("00001", "게임", "2019-05-10", 500000));
        this.fundList.push(new Fund("00002", "게임", "2019-05-10", 50000));
        this.fundList.push(new Fund("00003", "게임", "2019-05-10", 5000));
        this.fundList.push(new Fund("00004", "게임", "2019-05-10", 500));
        this.fundCnt += 4;

        this.popup = document.querySelector(".popup");
        document.querySelector("#btnClose").addEventListener("click", this.closePopup.bind(this));
        document.querySelector("#btnInvest").addEventListener("click", this.investFund.bind(this));

        this.signCanvas = document.querySelector("#sign");
        this.signCanvas.width = this.signCanvas.clientWidth;
        this.signCanvas.height = this.signCanvas.clientHeight;
        this.sCtx = this.signCanvas.getContext("2d");

        this.beforePoint = { x: 0, y: 0 };
        this.startDraw = false;
        //싸인창에 마우스 클릭할 경우 작동
        this.signCanvas.addEventListener("mousedown", (e) => {
            this.startDraw = true;
            this.beforePoint.x = e.offsetX;
            this.beforePoint.y = e.offsetY;
        });

        this.signCanvas.addEventListener("mouseup", (e) => {
            this.startDraw = false;
        });

        this.signCanvas.addEventListener("mousemove", (e) => {
            if (!this.startDraw) return;

            this.sCtx.beginPath();
            this.sCtx.moveTo(this.beforePoint.x, this.beforePoint.y);
            this.sCtx.lineTo(e.offsetX, e.offsetY);
            this.sCtx.stroke();

            this.beforePoint.x = e.offsetX;
            this.beforePoint.y = e.offsetY;
        });

        this.toastContainer = document.querySelector("#toastList");

        this.nav[0].click();//시작과 동시에 클릭됨
    }

    investFund() {
        let fundNo = document.querySelector("#investNo").value;
        const fund = this.fundList.find(x => x.number == fundNo);
        if (!fund) {
            return;
        }

        let money = document.querySelector("#money").value * 1;
        if (money <= 0) {
            this.showMsg("금액을 올바르게 입력하세요");
            return;
        }

        let name = document.querySelector("#name").value;
        let result = fund.invest(money);
        let signData = this.signCanvas.toDataURL();
        this.showMsg(result.msg);

        if (result.success) {
            //성공했을시
            this.popup.querySelector("#btnClose").click();

            //투자자 리스트 넣기
            let inv = new Investor(fund, name, money, signData);
            this.invList.push(inv);
            console.log(inv);

            //새로 고침
            this.nav[0].click();
        }
    }

    openPopup(fund) {
        this.popup.querySelector("#investNo").value = fund.number;
        this.popup.querySelector("#investName").value = fund.name;
        this.popup.querySelector("#name").value = "";
        this.popup.querySelector("#money").value = 0;
        this.sCtx.clearRect(0, 0, this.signCanvas.width, this.signCanvas.height);
        this.popup.classList.add("active");
    }

    closePopup() {
        this.popup.classList.remove("active");
    }

    changeMenu(e) {
        e.preventDefault(); //a태그의 기본적인 이벤트를 없에준다. / 자주 씀
        let target = e.target.dataset.target;

        //메뉴 클릭시 나오는 메인
        this.articleList.forEach(x => x.classList.remove("active"));
        document.querySelector("#" + target).classList.add("active");

        //메뉴바
        this.nav.forEach(x => x.classList.remove("active"));
        e.target.classList.add("active");

        this.loadingMethod[target]();

        //크기 변경
        let inner = document.querySelector(".inner-content");
        let h = document.querySelector("#" + target).clientHeight;
        inner.style.height = h + 'px';
    }

    //펀드 등록 페이지
    loadingRegister() {
        let no = "00000" + this.fundCnt;
        no = no.substring(no.length - 5);

        document.querySelector("#fundNo").value = no;
        document.querySelector("#fundName").value = "";
        document.querySelector("#endDate").value = "";
        document.querySelector("#total").value = "";
    }

    //펀드 등록하는 로직
    registerFund() {
        let no = document.querySelector("#fundNo").value;
        let name = document.querySelector("#fundName").value;
        let endDate = document.querySelector("#endDate").value;
        let total = document.querySelector("#total").value;

        if (name == "" || endDate == "" || total == "") {
            this.showMsg("값이 없거나 잘못된 형식 입니다.");
            return;
        }

        let fund = new Fund(no, name, endDate, total);
        this.fundList.push(fund);
        this.showMsg("등록 되었습니다.");
        this.fundCnt++;
        this.nav[0].click(); //등록후 이동됨
    }

    //펀드 리스트 페이지
    loadingList() {
        this.fundContainer.innerHTML = "";
        this.fundList.forEach(x => {
            let div = x.getTemplate();
            this.fundContainer.appendChild(div);
            div.querySelector("button").addEventListener("click", () => {
                this.openPopup(x);
            });
            x.drawCircle();
        });
    }

    //투자자 보는 페이지
    loadingInvestor() {
        this.invContainer.innerHTML = "";
        this.invList.forEach(x => {
            this.invContainer.appendChild(x.getTemplate());
        });
    }

    showMsg(msg) {
        //alert(msg);
        let div = document.createElement("div");
        div.classList.add("toast");
        div.innerHTML = `<p class="msg">${msg}</p>
        <span class="close">&times;</span>`;

        let closed = false;

        let closeTimer = setTimeout(() => {
            if(closed) return;
            closed = true;
            div.style.opacity = 0;
            div.style.transform = 0.8;
            setTimeout(() => {
                this.toastContainer.removeChild(div);
            }, 600);
        }, 2500);

        div.querySelector(".close").addEventListener("click", () => {
            if(closed) return;
            closed = true;
            div.style.opacity = 0;
            div.style.transform = 0.8;
            setTimeout(() => {
                this.toastContainer.removeChild(div);
            }, 600);
        });

        this.toastContainer.appendChild(div);
    }
}

//html의 코드를 다 읽었을 때
window.onload = function () {
    //변경될 일이 없다면 let대신 const를 써준다.
    const app = new App();
}