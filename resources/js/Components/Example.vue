<!-- resources/js/components/ExampleComponent.vue -->
<template>
    <div>
        <p>{{ messageFromPHP }}</p>
        <p>{{ messageFromProps }}</p>
    </div>
</template>

<script>
export default {
    props: ['message'], // Define a prop called 'message'
    data() {
        return {
            messageFromProps: this.message, // Assign the prop to a component data property
            messageFromPHP: ''
        };
    },
    mounted() {
        this.messageFromPHP = "Hello from Vue!"; // You can also set data properties directly in Vue
    }
}
</script>
