import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log(`Start seeding ...`);

    const superAdmin = await prisma.adminCredential.upsert({
        where: { role: 'superadmin' },
        update: {},
        create: {
            role: 'superadmin',
            password: 'superpassword',
        },
    });
    console.log(`Upserted superadmin credential.`);

    const childrenAdmin = await prisma.adminCredential.upsert({
        where: { role: 'children' },
        update: {},
        create: {
            role: 'children',
            password: 'childrenpassword',
        },
    });
    console.log(`Upserted children admin credential.`);


    const children2Admin = await prisma.adminCredential.upsert({
        where: { role: 'children2' },
        update: {},
        create: {
            role: 'children2',
            password: 'children2password',
        },
    });
    console.log(`Upserted children2 admin credential.`);

    const juniorsAdmin = await prisma.adminCredential.upsert({
        where: { role: 'juniors' },
        update: {},
        create: {
            role: 'juniors',
            password: 'juniorspassword',
        },
    });
    console.log(`Upserted juniors admin credential.`);
    
    const seniorsAdmin = await prisma.adminCredential.upsert({
        where: { role: 'seniors' },
        update: {},
        create: {
            role: 'seniors',
            password: 'seniorspassword',
        },
    });
    console.log(`Upserted seniors admin credential.`);

    console.log(`\nSeeding finished successfully.`);
    console.log(`Default passwords have been set. For example, the password for 'seniors' is 'seniorspassword'.`);
}

main()
    .catch((e: any) => {
        if (e.code === 'P2021') {
            console.error("\n❌ Database is not ready for seeding.");
            console.error(`The seed command failed because the 'AdminCredential' table is missing.`);
            console.error("\n✅ To fix this, you need to update your database schema. Run this command:");
            console.error("\n  npx prisma db push\n");
            console.error("After that finishes, run the seed command again:");
            console.error("\n  npx prisma db seed\n");
        } else {
            console.error("An unexpected error occurred during seeding:", e);
        }
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
