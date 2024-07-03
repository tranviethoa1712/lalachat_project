import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ChatLayout from '@/Layouts/ChatLayout';

function Home({ auth }) {
    return (
        <>
            Messages
        </>
    );
}
// This is Persistent layouts
Home.layout = (page) => {
    return (
        <AuthenticatedLayout
            user={page.props.auth.user}
        >   
            <ChatLayout children={page}>
            </ChatLayout>
        </AuthenticatedLayout>
    )
}

export default Home;