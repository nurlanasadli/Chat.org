<template>
    <div id="#app1">
        <div class="container-chat clearfix">
            <div class="people-list" id="people-list">
                <div class="search">
                    <input type="text" placeholder="search" />
                    <i class="fa fa-search"></i>
                </div>
                <ul class="list">
                    <li
                        @click.prevent="selectUser(user.id)"
                        class="clearfix"
                        v-for="user in userList"
                        :key="user.id"
                    >
                        <div class="about">
                            <div class="name">{{ user.name }}</div>
                            <div class="status" style="color: #fff">
                                <div
                                    v-if="
                                        onlineUser(user.id) ||
                                        online.id == user.id
                                    "
                                >
                                    <i class="fa fa-circle online"></i> online
                                </div>
                                <div v-else>
                                    <i class="fa fa-circle"></i> offline
                                </div>
                            </div>
                        </div>
                    </li>
                </ul>
            </div>

            <div class="chat">
                <div class="chat-header clearfix">
                    <img
                        src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/195612/chat_avatar_01_green.jpg"
                        alt="avatar"
                    />

                    <div class="chat-about">
                        <div v-if="userMessage.user" class="chat-with">
                            {{ userMessage.user.name }}
                            <div class="dropdown1">
                                <button
                                    class="btn btn-secondary dropdown-toggle"
                                    type="button"
                                    id="dropdownMenuButton1"
                                    data-bs-toggle="dropdown"
                                    aria-expanded="false"
                                >
                                    ...
                                </button>
                                <ul
                                    class="dropdown-menu"
                                    aria-labelledby="dropdownMenuButton1"
                                >
                                    <li>
                                        <a
                                            @click.prevent="deleteAllMessage"
                                            class="dropdown-item"
                                            href="#"
                                            >delete all messages</a
                                        >
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <i class="fa fa-star"></i>
                </div>
                <div
                    class="chat-history"
                    id="scroll-chat-bottom"
                    ref="chatHistory"
                >
                    <ul>
                        <li
                            class="clearfix"
                            v-for="message in userMessage.messages"
                            :key="message.id"
                        >
                            <div class="message-data align-right">
                                <span class="message-data-time">
                                    {{ formatMessageDate(message.created_at) }}
                                </span>
                                &nbsp; &nbsp;
                                <span class="message-data-name">{{
                                    message.user.name
                                }}</span>
                                <i class="fa fa-circle me rightsel"></i>
                                <div class="dropdown">
                                    <button
                                        class="btn btn-secondary dropdown-toggle"
                                        type="button"
                                        id="dropdownMenuButton1"
                                        data-bs-toggle="dropdown"
                                        aria-expanded="false"
                                    >
                                        ...
                                    </button>
                                    <ul
                                        class="dropdown-menu"
                                        aria-labelledby="dropdownMenuButton1"
                                    >
                                        <li>
                                            <a
                                                @click.prevent="
                                                    deleteSingleMessage(
                                                        message.id
                                                    )
                                                "
                                                class="dropdown-item"
                                                href="#"
                                                >delete</a
                                            >
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            <div
                                :class="`message float-right ${
                                    message.user.id == userMessage.user.id
                                        ? 'other-message'
                                        : 'my-message'
                                }`"
                            >
                                {{ message.message }}
                            </div>
                        </li>
                    </ul>
                </div>

                <div class="chat-message clearfix">
                    <p v-if="typing">{{ typing }} typing....</p>
                    <textarea
                        v-if="userMessage.user"
                        @keydown="typeingEvent(userMessage.user.id)"
                        @keydown.enter="sendMessage"
                        v-model="message"
                        name="message-to-send"
                        id="message-to-send"
                        placeholder="Type your message"
                        rows="3"
                    ></textarea>
                    <!-- <textarea
                    v-else
                    name="message-to-send"
                    id="message-to-send"
                    placeholder="Type your message"
                    rows="3"
                ></textarea> -->

                    <i class="fa fa-file-o"></i> &nbsp;&nbsp;&nbsp;
                    <i class="fa fa-file-image-o"></i>

                    <button>Send</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import _ from "lodash";
import axios from "axios";
import "../scss/dashboard.css";
import moment from "moment";

export default {
    mounted() {
        Echo.private(`chat.${authuser.id}`).listen("MessageSend", (e) => {
            this.selectUser(e.message.from);
            // console.log(e.message.message);
        });
        this.$store.dispatch("userList");

        Echo.private("typingevent").listenForWhisper("typing", (e) => {
            if (
                e.user.id == this.userMessage.user.id &&
                e.userId == authuser.id
            ) {
                this.typing = e.user.name;
            }
            setTimeout(() => {
                this.typing = "";
            }, 2000);
        });
        Echo.join("liveuser")
            .here((users) => {
                this.users = users;
            })
            .joining((user) => {
                this.online = user;
            })
            .leaving((user) => {
                console.log(user.name);
            });
        const chatHistory = document.getElementById("scroll-chat-bottom");
        chatHistory.addEventListener("scroll", () => {
            this.userScrolledUp =
                chatHistory.scrollTop <
                chatHistory.scrollHeight - chatHistory.clientHeight;
        });
    },
    data() {
        return {
            message: "",
            typing: "",
            users: [],
            online: "",
            userScrolledUp: false,
        };
    },
    computed: {
        userList() {
            return this.$store.getters.userList;
        },
        userMessage() {
            return this.$store.getters.userMessage;
        },
    },
    created() {},
    methods: {
        formatMessageDate(dateTime) {
            const messageDate = moment(dateTime);
            const currentDate = moment();

            if (messageDate.isSame(currentDate, "day")) {
                return messageDate.format("h:mm A");
            } else {
                return messageDate.format("MMMM Do YYYY, h:mm A");
            }
        },
        selectUser(userId) {
            this.$store.dispatch("userMessage", userId);
            this.userScrolledUp = false; // Reset the flag when a new user is selected
        },
        sendMessage(e) {
            e.preventDefault();
            if (this.message != "") {
                axios
                    .post("/senemessage", {
                        message: this.message,
                        user_id: this.userMessage.user.id,
                    })
                    .then((response) => {
                        this.selectUser(this.userMessage.user.id);
                        setTimeout(() => {
                            const chatHistory = this.$refs.chatHistory;
                            chatHistory.scrollTop = chatHistory.scrollHeight;
                        }, 0); 
                    });
                this.message = "";
            }
        },
        scrollChat() {
            this.$nextTick(() => {
                const chatHistory = 
                    document.getElementById("scroll-chat-bottom");
                chatHistory.scrollTop = chatHistory.scrollHeight;
            });
        },

        deleteSingleMessage(messageId) {
            axios.get(`/deletesinglemessage/${messageId}`).then((response) => {
                this.selectUser(this.userMessage.user.id);
            });
        },
        deleteAllMessage() {
            axios
                .get(`/deleteallmessage/${this.userMessage.user.id}`)
                .then((response) => {
                    this.selectUser(this.userMessage.user.id);
                });
        },
        typeingEvent(userId) {
            Echo.private("typingevent").whisper("typing", {
                user: authuser,
                typing: this.message,
                userId: userId,
            });
        },
        onlineUser(userId) {
            return _.find(this.users, { id: userId });
        },
    },
};
</script>
<style>
.people-list ul {
    overflow-y: scroll !important;
}
</style>
