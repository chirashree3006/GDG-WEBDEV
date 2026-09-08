import { NextResponse } from 'next/server';
import { connect, serializeFirestoreData } from '@/lib/db';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export const dynamic = "force-dynamic";

export async function PATCH(req, { params }) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 });
        }

        if (session.user.role !== 'admin') {
            return NextResponse.json({ success: false, message: 'Forbidden: admin access required' }, { status: 403 });
        }

        const db = await connect();
        const { id } = params;
        const { shortlisted } = await req.json();

        const docRef = db.collection('formData').doc(id);
        const existing = await docRef.get();

        if (!existing.exists) {
            return NextResponse.json({ success: false, message: 'Applicant not found' }, { status: 404 });
        }

        await docRef.update({ shortlisted });
        const snapshot = await docRef.get();

        const applicant = {
            id: snapshot.id,
            _id: snapshot.id,
            ...serializeFirestoreData(snapshot.data()),
        };

        return NextResponse.json({ success: true, data: applicant });
    } catch (error) {
        console.error('Error updating applicant:', error.message);
        return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }
}
