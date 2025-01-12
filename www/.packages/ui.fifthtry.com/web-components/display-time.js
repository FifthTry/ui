class DisplayTime extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.refreshInterval = 100; // in milliseconds
    }

    connectedCallback() {
        let data = window.ftd.component_data(this);
        this.timestamp = fastn_utils.getStaticValue(data.timestamp.get());
        this.date = new Date(this.timestamp / 1e6);
        this.render();
        this.updateTimeAgo();
        this.interval = setInterval(() => this.updateTimeAgo(), this.refreshInterval);
    }

    disconnectedCallback() {
        clearInterval(this.interval);
    }

    updateTimeAgo() {
        const timeAgoText = this.timeAgo(this.date);
        this.shadowRoot.querySelector('.time-ago').textContent = timeAgoText;
    }

    render() {
        const utcDate = this.date;
        this.shadowRoot.innerHTML = `
            <style>
                .time-ago-container {
                    position: relative;
                    display: inline-block;
                    text-wrap: nowrap;
                }
                .time-ago-container .tooltip {
                    visibility: hidden;
                    background-color: black;
                    color: #fff;
                    text-align: center;
                    border-radius: 5px;
                    padding: 5px;
                    position: absolute;
                    z-index: 1;
                    bottom: 100%;
                    left: 50%;
                    margin-left: -50px;
                    opacity: 0;
                    transition: opacity 0.3s;
                }
                .time-ago-container:hover .tooltip {
                    visibility: visible;
                    opacity: 1;
                }
            </style>
            <div class="time-ago-container">
                <span class="time-ago"></span>
                <div class="tooltip">${utcDate}</div>
            </div>
        `;
    }

    timeAgo(date) {
        const now = new Date();
        const secondsPast = (now.getTime() - date.getTime()) / 1000;

        if (secondsPast === 1) {
            return `${Math.floor(secondsPast)} second ago`;
        } else if (secondsPast < 60) {
            return `${Math.floor(secondsPast)} seconds ago`;
        } else if (Math.floor(secondsPast / 60) === 1) {
            this.refreshInterval = 60 * 1000;
            return `1 minute ago`;
        } else if (secondsPast < 3600) {
            this.refreshInterval = 60000;
            return `${Math.floor(secondsPast / 60)} minutes ago`;
        } else if (Math.floor(secondsPast / 3600) === 1) {
            this.refreshInterval = 3600 * 1000;
            return `1 hour ago`;
        } else if (secondsPast < 86400) {
            this.refreshInterval = 3600 * 1000;
            return `${Math.floor(secondsPast / 3600)} hours ago`;
        } else if (Math.floor(secondsPast / 86400) === 1) {
            this.refreshInterval = 86400 * 1000;
            return `1 day ago`;
        } else if (secondsPast < 2592000) {
            this.refreshInterval = 86400 * 1000;
            return `${Math.floor(secondsPast / 86400)} days ago`;
        } else if (Math.floor(secondsPast / 2592000) === 1) {
            this.refreshInterval = 2592000 * 1000;
            return `1 months ago`;
        } else if (secondsPast < 31536000) {
            this.refreshInterval = 2592000 * 1000;
            return `${Math.floor(secondsPast / 2592000)} months ago`;
        } else if (Math.floor(secondsPast / 31536000) === 1) {
            this.refreshInterval = 31536000 * 1000;
            return `${Math.floor(secondsPast / 31536000)} years ago`;
        } else {
            this.refreshInterval = 31536000 * 1000;
            return `${Math.floor(secondsPast / 31536000)} years ago`;
        }
    }
}

customElements.define('display-time', DisplayTime);
