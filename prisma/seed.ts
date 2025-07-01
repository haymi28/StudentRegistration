import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log(`Start seeding ...`);

    await prisma.adminCredential.upsert({
        where: { role: 'superadmin' },
        update: {},
        create: {
            role: 'superadmin',
            password: 'superpassword',
        },
    });

    await prisma.adminCredential.upsert({
        where: { role: 'children' },
        update: {},
        create: {
            role: 'children',
            password: 'childrenpassword',
        },
    });

    await prisma.adminCredential.upsert({
        where: { role: 'children2' },
        update: {},
        create: {
            role: 'children2',
            password: 'children2password',
        },
    });

    await prisma.adminCredential.upsert({
        where: { role: 'juniors' },
        update: {},
        create: {
            role: 'juniors',
            password: 'juniorspassword',
        },
    });
    
    await prisma.adminCredential.upsert({
        where: { role: 'seniors' },
        update: {},
        create: {
            role: 'seniors',
            password: 'seniorspassword',
        },
    });

    console.log(`Seeding finished.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
