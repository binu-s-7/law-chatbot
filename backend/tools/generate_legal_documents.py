import openai

from open_ai_key import supabase

# Example usage with a fictional template string
template_placeholder_identify = """
This Non-Disclosure Agreement ("Agreement") is entered into as of [Date] by and between [Party A Name], with an address at [Party A Address] ("Disclosing Party"), and [Party B Name], with an address at [Party B Address] ("Receiving Party").

1. Confidential Information
a. For the purposes of this Agreement, "Confidential Information" includes all written, electronic, or oral information that the Disclosing Party provides to the Receiving Party, including but not limited to business processes, client information, business strategies, trade secrets, and technology specifications.
"""


def identify_placeholders_in_template(content, model="gpt-4-1106-preview", temperature=0.7, max_tokens=512):
    """
    Function to make an OpenAI completion request to identify placeholders within a legal document template.
    This function will return a list of placeholders that need user input to fill.
    """
    combined_query = [
        {
            "role": "system",
            "content": "You are an AI assistant tasked with analyzing a legal document template to identify placeholders that need to be filled. Examine the template provided, list all placeholders, and suggest the type of information required for each."
        },
        {
            "role": "user",
            "content": f"Text: {content}"  # Assuming template_content has been defined earlier
        }
    ]

    response = openai.chat.completions.create(
        model=model,
        messages=combined_query,
        temperature=temperature,
        max_tokens=max_tokens,
        top_p=1,
        frequency_penalty=0,
        presence_penalty=0
    )

    return response.choices[0].message.content


def get_info_need_fill_placeholder(temp_id):
    # from supabase get data on template id
    response = supabase.table('doc_templates').select("*").eq('template_id', temp_id).execute().data[0]
    # print(response)

    # print(response['name'])
    # print(response['content'])

    # Call the function
    identified_placeholders = identify_placeholders_in_template(response['content'])

    # print("\n\n\n\nIdentified Placeholders and Required Information:", identified_placeholders)

    return identified_placeholders


def find_entities_for_placeholders(entities, context, model="gpt-4-1106-preview", temperature=0.7, max_tokens=2000):
    """
    Function to make an OpenAI completion request to identify placeholders within a legal document template.
    This function will return a list of placeholders that need user input to fill.
    """
    combined_query = [
        {
            "role": "system",
            "content": "You are now tasked with finding answers to the identified placeholders in the legal document based on the provided context. Analyze the context to determine the appropriate information for each placeholder. Output the results in JSON format, which should include two sections: 'found' and 'not_found'. For entities where information is found, include the entity, the found information, and a description. For entities where information is not found, include the entity and its description only."
        },
        {
            "role": "user",
            "content": f"##########Placehodlers######## : {entities}\n\n\n"
                       f"##########Context######## : {context}"
        }
    ]

    response = openai.chat.completions.create(
        model=model,
        messages=combined_query,
        temperature=temperature,
        max_tokens=max_tokens,
        top_p=1,
        frequency_penalty=0,
        presence_penalty=0
    )

    return response.choices[0].message.content


def finlize_doc(template, entities, model="gpt-4-1106-preview", temperature=0.7, max_tokens=2000):
    """
    Function to make an OpenAI completion request to identify placeholders within a legal document template.
    This function will return a list of placeholders that need user input to fill.
    """
    combined_query = [
        {
            "role": "system",
            "content": "Your task is to complete a legal document by filling in the placeholders with the specific "
                       "information extracted from the provided context. Use the placeholders that were identified as "
                       "'found' in the previous analysis to replace placeholders in the legal document template. "
                       "Produce a complete document that incorporates all the relevant information accurately. Use "
                       "the <comment> </comment> tags to indicate any placeholders or information that require further action or decisions."
        },
        {
            "role": "user",
            "content": f"##########Template######## : {template}\n\n\n"
                       f"##########Placehodlers######## : {entities}"
        }
    ]

    response = openai.chat.completions.create(
        model=model,
        messages=combined_query,
        temperature=temperature,
        max_tokens=max_tokens,
        top_p=1,
        frequency_penalty=0,
        presence_penalty=0
    )

    return response.choices[0].message.content


if __name__ == "__main__":
    temp_id = 1

    # from supabase get data on template id
    response = supabase.table('doc_templates').select("*").eq('template_id', temp_id).execute().data[0]
    # print(response)

    # print(response['name'])
    # print(response['content'])

    # Call the function
    identified_placeholders = identify_placeholders_in_template(response['content'])

    print("\n\n\n\nIdentified Placeholders and Required Information:", identified_placeholders)

    context = """Scenario: Partnership for a Specialized Software Project
Background: You are the founder of a software development company, CodeCraft Inc., which specializes in creating bespoke solutions for financial institutions. To embark on a new project involving the development of a sophisticated asset management platform, you plan to collaborate with FinAnalytics Ltd., a firm known for its expertise in financial analytics and data processing.

Details for the NDA:

[Date]: The agreement is set to be entered on May 5, 2024, which will be the effective date.
[Party A Name]: "CodeCraft Inc."
[Party A Address]: "1234 Developer Drive, TechTown, Silicon State, 98765"
[Party B Name]: "FinAnalytics Ltd."
[Party B Address]: "400 Finance Lane, Analytic City, Data State, 54321"
[Describe Purpose]: "The purpose of this agreement is to permit FinAnalytics Ltd. to use the confidential information provided by CodeCraft Inc. solely for the purpose of evaluating and engaging in the development of the asset management software platform."
[State/Country]: "California, USA"
[Name]: The names printed for the signatories will be "Jane Doe" for CodeCraft Inc. and "John Smith" for FinAnalytics Ltd.
[Title]: Jane Doe is the "CEO" of CodeCraft Inc., and John Smith is the "Director of Operations" at FinAnalytics Ltd.
[Date]: Both parties will sign the agreement on May 5, 2024.
Execution: Prior to starting the project, both parties agree to meet at CodeCraft Inc.’s headquarters to sign the NDA. This ensures that any discussions regarding the project, including the sharing of sensitive information, are legally bound by confidentiality from the effective date.

Outcome: With the NDA in place, both CodeCraft Inc. and FinAnalytics Ltd. can proceed confidently, knowing that the information exchanged during their collaboration is protected. This legal groundwork facilitates a secure environment for innovation and shared expertise, paving the way for successful development and deployment of the new software."""

    print(find_entities_for_placeholders(identified_placeholders, context))
