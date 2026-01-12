import { a as authService, r as reactExports, j as jsxRuntimeExports, f as firestoreService } from "./entry-1767948920134-index.js";
import { C as Camera } from "./chunk-1767948920163-index.js";
import { healthAvatarService } from "./chunk-1767948920148-healthAvatarService.js";
function ProfileSetup({ onComplete }) {
  const currentUser = authService.getCurrentUser();
  const existingProfile = currentUser?.profile || {};
  const [step, setStep] = reactExports.useState(1);
  const [selectedAvatar, setSelectedAvatar] = reactExports.useState(existingProfile.avatar || "🧘");
  const [photoData, setPhotoData] = reactExports.useState(existingProfile.photo || null);
  const [selectedAllergens, setSelectedAllergens] = reactExports.useState(existingProfile.allergens || []);
  const [selectedDiet, setSelectedDiet] = reactExports.useState(existingProfile.dietaryPreferences || []);
  const [basicInfo, setBasicInfo] = reactExports.useState({
    fullName: existingProfile.fullName || "",
    age: existingProfile.age ? String(existingProfile.age) : "",
    gender: existingProfile.gender || "",
    height: existingProfile.height ? String(existingProfile.height) : "",
    weight: existingProfile.weight ? String(existingProfile.weight) : "",
    goalSteps: existingProfile.goalSteps ? String(existingProfile.goalSteps) : "10000",
    bloodType: existingProfile.bloodType || ""
  });
  const [medicalInfo, setMedicalInfo] = reactExports.useState({
    conditions: existingProfile.medicalConditions || [],
    medications: existingProfile.medications || [],
    injuries: existingProfile.injuries || [],
    surgeries: existingProfile.surgeries || "",
    familyHistory: existingProfile.familyHistory || []
  });
  const [lifestyleInfo, setLifestyleInfo] = reactExports.useState({
    fitnessLevel: existingProfile.fitnessLevel || "",
    exerciseFrequency: existingProfile.exerciseFrequency || "",
    sleepHours: existingProfile.sleepHours ? String(existingProfile.sleepHours) : "",
    stressLevel: existingProfile.stressLevel || "",
    smoker: existingProfile.smoker || false,
    alcoholFrequency: existingProfile.alcoholFrequency || "",
    waterIntake: existingProfile.waterIntake || "",
    workType: existingProfile.workType || ""
  });
  const avatars = ["🧘", "🏃", "💪", "🧗", "🚴", "🏊", "⛹️", "🤸", "🤾", "🏋️", "🤺", "⛷️"];
  const commonAllergens = [
    { name: "gluten", icon: "🌾", severity: "moderate" },
    { name: "dairy", icon: "🥛", severity: "moderate" },
    { name: "nuts", icon: "🥜", severity: "severe" },
    { name: "shellfish", icon: "🦐", severity: "severe" },
    { name: "eggs", icon: "🥚", severity: "moderate" },
    { name: "soy", icon: "🫘", severity: "moderate" },
    { name: "fish", icon: "🐟", severity: "severe" },
    { name: "sesame", icon: "🌰", severity: "moderate" }
  ];
  const dietPreferences = [
    { name: "vegetarian", icon: "🥗" },
    { name: "vegan", icon: "🌱" },
    { name: "keto", icon: "🥑" },
    { name: "paleo", icon: "🍖" },
    { name: "halal", icon: "☪️" },
    { name: "kosher", icon: "✡️" }
  ];
  const handleTakePhoto = async () => {
    try {
      const photo = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: "base64",
        source: "CAMERA"
      });
      setPhotoData(`data:image/jpeg;base64,${photo.base64String}`);
    } catch (error) {
    }
  };
  const toggleAllergen = (allergen) => {
    if (selectedAllergens.includes(allergen.name)) {
      setSelectedAllergens(selectedAllergens.filter((a) => a !== allergen.name));
    } else {
      setSelectedAllergens([...selectedAllergens, allergen.name]);
    }
  };
  const toggleDiet = (diet) => {
    if (selectedDiet.includes(diet.name)) {
      setSelectedDiet(selectedDiet.filter((d) => d !== diet.name));
    } else {
      setSelectedDiet([...selectedDiet, diet.name]);
    }
  };
  const medicalConditions = [
    { name: "diabetes", icon: "🩸" },
    { name: "hypertension", icon: "💔" },
    { name: "asthma", icon: "🫁" },
    { name: "arthritis", icon: "🦴" },
    { name: "heart-disease", icon: "❤️" },
    { name: "thyroid", icon: "🦋" },
    { name: "migraine", icon: "🤕" },
    { name: "anxiety", icon: "😰" },
    { name: "depression", icon: "😔" }
  ];
  const familyHistoryConditions = [
    "diabetes",
    "heart-disease",
    "cancer",
    "alzheimers",
    "stroke",
    "hypertension"
  ];
  const toggleCondition = (condition) => {
    if (medicalInfo.conditions.includes(condition)) {
      setMedicalInfo({ ...medicalInfo, conditions: medicalInfo.conditions.filter((c) => c !== condition) });
    } else {
      setMedicalInfo({ ...medicalInfo, conditions: [...medicalInfo.conditions, condition] });
    }
  };
  const toggleFamilyHistory = (condition) => {
    if (medicalInfo.familyHistory.includes(condition)) {
      setMedicalInfo({ ...medicalInfo, familyHistory: medicalInfo.familyHistory.filter((c) => c !== condition) });
    } else {
      setMedicalInfo({ ...medicalInfo, familyHistory: [...medicalInfo.familyHistory, condition] });
    }
  };
  const handleComplete = async () => {
    try {
      if (false) ;
      const severityMap = {};
      selectedAllergens.forEach((allergen) => {
        const allergenData = commonAllergens.find((a) => a.name === allergen);
        severityMap[allergen] = allergenData?.severity || "moderate";
      });
      const heightM = basicInfo.height / 100;
      const bmi = basicInfo.weight / (heightM * heightM);
      if (false) ;
      if (false) ;
      if (false) ;
      if (false) ;
      if (false) ;
      if (false) ;
      await authService.updateProfile({
        // Avatar & Identity
        avatar: photoData || selectedAvatar,
        photo: photoData,
        fullName: basicInfo.fullName || "",
        // Basic Metrics
        age: basicInfo.age ? parseInt(basicInfo.age) : void 0,
        gender: basicInfo.gender || "",
        height: basicInfo.height ? parseInt(basicInfo.height) : void 0,
        weight: basicInfo.weight ? parseInt(basicInfo.weight) : void 0,
        bmi: bmi && !isNaN(bmi) ? parseFloat(bmi.toFixed(1)) : void 0,
        bloodType: basicInfo.bloodType || "",
        goalSteps: basicInfo.goalSteps ? parseInt(basicInfo.goalSteps) : 1e4,
        // Diet & Allergens
        allergens: selectedAllergens,
        allergenSeverity: severityMap,
        dietaryPreferences: selectedDiet,
        // Medical History
        medicalConditions: medicalInfo.conditions,
        medications: medicalInfo.medications,
        injuries: medicalInfo.injuries,
        surgeries: medicalInfo.surgeries,
        familyHistory: medicalInfo.familyHistory,
        // Lifestyle
        fitnessLevel: lifestyleInfo.fitnessLevel || "",
        exerciseFrequency: lifestyleInfo.exerciseFrequency || "",
        sleepHours: lifestyleInfo.sleepHours ? parseInt(lifestyleInfo.sleepHours) : void 0,
        stressLevel: lifestyleInfo.stressLevel || "",
        smoker: lifestyleInfo.smoker || false,
        alcoholFrequency: lifestyleInfo.alcoholFrequency || "",
        waterIntake: lifestyleInfo.waterIntake || "",
        workType: lifestyleInfo.workType || "",
        // Completion
        profileCompleted: true,
        profileCompletedDate: (/* @__PURE__ */ new Date()).toISOString()
      });
      if (false) ;
      try {
        const userId = authService.getCurrentUser()?.uid;
        if (!await firestoreService.get("stepHistory", userId)) {
          await firestoreService.save("stepHistory", [], userId);
        }
        if (!await firestoreService.get("foodLog", userId)) {
          await firestoreService.save("foodLog", [], userId);
        }
        if (!await firestoreService.get("workoutHistory", userId)) {
          await firestoreService.save("workoutHistory", [], userId);
        }
        if (!await firestoreService.get("sleepLog", userId)) {
          await firestoreService.save("sleepLog", [], userId);
        }
        if (!await firestoreService.get("waterLog", userId)) {
          await firestoreService.save("waterLog", [], userId);
        }
        if (!await firestoreService.get("weeklySteps", userId)) {
          await firestoreService.save("weeklySteps", [], userId);
        }
      } catch (syncError) {
        if (false) ;
      }
      if (false) ;
      if (false) ;
      healthAvatarService.clearCache();
      if (false) ;
      onComplete();
    } catch (error) {
      alert("Error saving profile: " + error.message + "\n\nPlease try again or contact support.");
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "profile-setup-overlay", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "profile-setup", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "modal-close", onClick: onComplete, style: {
      position: "absolute",
      top: "15px",
      right: "15px",
      background: "#8B5FE8",
      border: "none",
      color: "white",
      fontSize: "28px",
      width: "40px",
      height: "40px",
      borderRadius: "50%",
      cursor: "pointer",
      zIndex: 10
    }, children: "×" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { children: "🧬 Complete Your Health Profile" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "setup-progress", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `progress-dot ${step >= 1 ? "active" : ""}`, children: "1" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `progress-line ${step >= 2 ? "active" : ""}` }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `progress-dot ${step >= 2 ? "active" : ""}`, children: "2" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `progress-line ${step >= 3 ? "active" : ""}` }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `progress-dot ${step >= 3 ? "active" : ""}`, children: "3" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `progress-line ${step >= 4 ? "active" : ""}` }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `progress-dot ${step >= 4 ? "active" : ""}`, children: "4" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `progress-line ${step >= 5 ? "active" : ""}` }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `progress-dot ${step >= 5 ? "active" : ""}`, children: "5" })
    ] }),
    step === 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "setup-step", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "Choose Your Avatar" }),
      photoData ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "photo-preview", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: photoData, alt: "Profile" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "change-photo", onClick: handleTakePhoto, children: "Change Photo" })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "avatar-grid", children: avatars.map((avatar) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            className: `avatar-option ${selectedAvatar === avatar ? "selected" : ""}`,
            onClick: () => setSelectedAvatar(avatar),
            children: avatar
          },
          avatar
        )) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "take-photo-btn", onClick: handleTakePhoto, children: "📷 Or Take a Photo" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "next-btn", onClick: () => setStep(2), children: "Next →" })
    ] }),
    step === 2 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "setup-step", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "Your Allergens & Diet" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "subtitle", children: "Select any allergens you need to avoid" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "allergen-grid", children: commonAllergens.map((allergen) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          className: `allergen-card ${selectedAllergens.includes(allergen.name) ? "selected" : ""}`,
          onClick: () => toggleAllergen(allergen),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "allergen-icon", children: allergen.icon }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "allergen-name", children: allergen.name }),
            allergen.severity === "severe" && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "severity-badge", children: "⚠️" })
          ]
        },
        allergen.name
      )) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "Dietary Preferences (Optional)" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "diet-grid", children: dietPreferences.map((diet) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          className: `diet-card ${selectedDiet.includes(diet.name) ? "selected" : ""}`,
          onClick: () => toggleDiet(diet),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "diet-icon", children: diet.icon }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "diet-name", children: diet.name })
          ]
        },
        diet.name
      )) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "step-buttons", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "back-btn", onClick: () => setStep(1), children: "← Back" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "next-btn", onClick: () => setStep(3), children: "Next →" })
      ] })
    ] }),
    step === 3 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "setup-step", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "📊 Basic Information" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "subtitle", children: "Essential data for your Health Avatar calculations" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "form-grid", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "form-group full-width", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { children: "Full Name *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "text",
              placeholder: "John Smith",
              value: basicInfo.fullName,
              onChange: (e) => setBasicInfo({ ...basicInfo, fullName: e.target.value }),
              required: true
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "form-group", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { children: "Age *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "number",
              placeholder: "25",
              value: basicInfo.age,
              onChange: (e) => setBasicInfo({ ...basicInfo, age: e.target.value }),
              required: true
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "form-group", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { children: "Gender *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "select",
            {
              value: basicInfo.gender,
              onChange: (e) => setBasicInfo({ ...basicInfo, gender: e.target.value }),
              required: true,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Select" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "male", children: "Male" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "female", children: "Female" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "other", children: "Other" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "prefer-not-to-say", children: "Prefer not to say" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "form-group", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { children: "Height (cm) *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "number",
              placeholder: "175",
              value: basicInfo.height,
              onChange: (e) => setBasicInfo({ ...basicInfo, height: e.target.value }),
              required: true
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "form-group", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { children: "Weight (kg) *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "number",
              placeholder: "70",
              value: basicInfo.weight,
              onChange: (e) => setBasicInfo({ ...basicInfo, weight: e.target.value }),
              required: true
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "form-group", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { children: "Blood Type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "select",
            {
              value: basicInfo.bloodType,
              onChange: (e) => setBasicInfo({ ...basicInfo, bloodType: e.target.value }),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Unknown" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "A+", children: "A+" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "A-", children: "A-" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "B+", children: "B+" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "B-", children: "B-" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "AB+", children: "AB+" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "AB-", children: "AB-" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "O+", children: "O+" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "O-", children: "O-" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "form-group", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { children: "Daily Step Goal" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "number",
              placeholder: "10000",
              value: basicInfo.goalSteps,
              onChange: (e) => setBasicInfo({ ...basicInfo, goalSteps: e.target.value })
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "step-buttons", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "back-btn", onClick: () => setStep(2), children: "← Back" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "next-btn", onClick: () => setStep(4), children: "Next →" })
      ] })
    ] }),
    step === 4 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "setup-step", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "🏥 Medical History" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "subtitle", children: "Helps calculate accurate health predictions (all optional)" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "Existing Conditions" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "condition-grid", children: medicalConditions.map((condition) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          className: `condition-card ${medicalInfo.conditions.includes(condition.name) ? "selected" : ""}`,
          onClick: () => toggleCondition(condition.name),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "condition-icon", children: condition.icon }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "condition-name", children: condition.name })
          ]
        },
        condition.name
      )) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "Current Medications" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "textarea",
        {
          className: "medications-input",
          placeholder: "List any medications you're currently taking (optional)",
          value: medicalInfo.medications.join("\n"),
          onChange: (e) => setMedicalInfo({ ...medicalInfo, medications: e.target.value.split("\n").filter((m) => m.trim()) }),
          rows: "3"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "Family History" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "subtitle-small", children: "Select any conditions in your immediate family" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "family-history-grid", children: familyHistoryConditions.map((condition) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          className: `family-history-btn ${medicalInfo.familyHistory.includes(condition) ? "selected" : ""}`,
          onClick: () => toggleFamilyHistory(condition),
          children: condition
        },
        condition
      )) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "step-buttons", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "back-btn", onClick: () => setStep(3), children: "← Back" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "next-btn", onClick: () => setStep(5), children: "Next →" })
      ] })
    ] }),
    step === 5 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "setup-step", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "🏃 Lifestyle & Habits" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "subtitle", children: "Critical for accurate health projections" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "form-grid", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "form-group", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { children: "Current Fitness Level" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "select",
            {
              value: lifestyleInfo.fitnessLevel,
              onChange: (e) => setLifestyleInfo({ ...lifestyleInfo, fitnessLevel: e.target.value }),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Select" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "sedentary", children: "Sedentary (little exercise)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "lightly-active", children: "Lightly Active (1-2 days/week)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "moderately-active", children: "Moderately Active (3-5 days/week)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "very-active", children: "Very Active (6-7 days/week)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "athlete", children: "Athlete (training daily)" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "form-group", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { children: "Exercise Frequency" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "select",
            {
              value: lifestyleInfo.exerciseFrequency,
              onChange: (e) => setLifestyleInfo({ ...lifestyleInfo, exerciseFrequency: e.target.value }),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Select" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "never", children: "Never" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "1-2-week", children: "1-2 times/week" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "3-4-week", children: "3-4 times/week" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "5-6-week", children: "5-6 times/week" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "daily", children: "Daily" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "form-group", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { children: "Average Sleep Hours" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "number",
              placeholder: "7",
              value: lifestyleInfo.sleepHours,
              onChange: (e) => setLifestyleInfo({ ...lifestyleInfo, sleepHours: e.target.value })
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "form-group", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { children: "Stress Level" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "select",
            {
              value: lifestyleInfo.stressLevel,
              onChange: (e) => setLifestyleInfo({ ...lifestyleInfo, stressLevel: e.target.value }),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Select" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "low", children: "Low" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "moderate", children: "Moderate" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "high", children: "High" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "very-high", children: "Very High" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "form-group", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { children: "Smoking Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "select",
            {
              value: lifestyleInfo.smoker,
              onChange: (e) => setLifestyleInfo({ ...lifestyleInfo, smoker: e.target.value === "true" }),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "false", children: "Non-smoker" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "true", children: "Smoker" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "form-group", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { children: "Alcohol Consumption" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "select",
            {
              value: lifestyleInfo.alcoholFrequency,
              onChange: (e) => setLifestyleInfo({ ...lifestyleInfo, alcoholFrequency: e.target.value }),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Select" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "never", children: "Never" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "rarely", children: "Rarely (1-2/month)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "social", children: "Social (1-2/week)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "regular", children: "Regular (3-5/week)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "daily", children: "Daily" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "form-group", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { children: "Daily Water Intake" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "select",
            {
              value: lifestyleInfo.waterIntake,
              onChange: (e) => setLifestyleInfo({ ...lifestyleInfo, waterIntake: e.target.value }),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Select" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "low", children: "Low (<4 glasses)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "moderate", children: "Moderate (4-6 glasses)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "good", children: "Good (7-8 glasses)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "excellent", children: "Excellent (8+ glasses)" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "form-group", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { children: "Work Type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "select",
            {
              value: lifestyleInfo.workType,
              onChange: (e) => setLifestyleInfo({ ...lifestyleInfo, workType: e.target.value }),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Select" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "sedentary", children: "Sedentary (desk job)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "light-activity", children: "Light Activity" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "moderate-activity", children: "Moderate Activity" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "physical", children: "Physical Labor" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "very-physical", children: "Very Physical" })
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "completion-summary", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "✅ Profile Summary" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Your comprehensive health profile will power:" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "🧬 Personalized Health Avatar" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "📊 Accurate BMI & health score calculations" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "🔮 Future health predictions" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "🎯 Custom exercise & meal recommendations" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "💊 Allergen warnings & food safety" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "🏥 Emergency medical data package" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "step-buttons", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "back-btn", onClick: () => setStep(4), children: "← Back" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "complete-btn", onClick: handleComplete, children: "Complete Profile ✓" })
      ] })
    ] })
  ] }) });
}
export {
  ProfileSetup as default
};
