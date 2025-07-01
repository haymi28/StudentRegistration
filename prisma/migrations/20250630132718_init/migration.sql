-- CreateTable
CREATE TABLE "Student" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "christianName" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "educationLevel" TEXT NOT NULL,
    "dob" TIMESTAMP(3) NOT NULL,
    "subcity" TEXT NOT NULL,
    "kebele" TEXT NOT NULL,
    "houseNumber" TEXT NOT NULL,
    "houseAddressDetail" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "additionalPhone" TEXT,
    "fatherPhone" TEXT,
    "motherName" TEXT,
    "motherPhone" TEXT,
    "joiningDate" TIMESTAMP(3) NOT NULL,
    "formFilledDate" TIMESTAMP(3) NOT NULL,
    "role" TEXT NOT NULL,
    "photoUrl" TEXT,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Student_id_key" ON "Student"("id");
