#!/usr/bin/env python
"""
Test script for AI Mentor end-to-end functionality.

This script tests the AI Mentor system including:
1. Bedrock adapter initialization
2. Prompt builder functionality
3. Mentor service response generation
4. All mentor modes (learn, code, roadmap, productivity)
"""

import os
import sys
import json
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent))

from ai_mentor.mentor_service import mentor_service
from ai_mentor.prompt_builder import PromptBuilder
from services.bedrock_adapter import bedrock_adapter


def test_bedrock_adapter():
    """Test Bedrock adapter initialization and availability."""
    print("\n" + "="*60)
    print("TEST 1: Bedrock Adapter Initialization")
    print("="*60)
    
    print(f"Bedrock Adapter Enabled: {bedrock_adapter.enabled}")
    print(f"Bedrock Client Available: {bedrock_adapter.bedrock_client is not None}")
    print(f"Model ID: {bedrock_adapter.BEDROCK_MODEL_ID}")
    print(f"Expected Model: anthropic.claude-3-haiku-20240307-v1:0")
    
    if bedrock_adapter.BEDROCK_MODEL_ID == "anthropic.claude-3-haiku-20240307-v1:0":
        print("✅ Model ID is correct!")
    else:
        print(f"❌ Model ID mismatch! Got {bedrock_adapter.BEDROCK_MODEL_ID}")
    
    return True


def test_prompt_builder():
    """Test prompt builder for all modes."""
    print("\n" + "="*60)
    print("TEST 2: Prompt Builder - All Modes")
    print("="*60)
    
    modes = {
        'learn': {
            'user_input': 'What is machine learning?',
            'context': {
                'user_level': 'beginner',
                'track': 'ai',
                'topic': 'Machine Learning Basics',
                'level': 'beginner',
                'name': 'Test User'
            }
        },
        'code': {
            'user_input': 'def hello():\n    print("world")',
            'context': {
                'code_mode': 'Explain Code',
                'language': 'Python',
                'user_level': 'intermediate'
            }
        },
        'productivity': {
            'user_input': 'What tasks should I do today?',
            'context': {
                'learning_track': 'Backend Development',
                'current_topic': 'Django',
                'completion_rate': 50
            }
        },
        'roadmap': {
            'user_input': 'Learn Python for backend development',
            'context': {
                'user_level': 'beginner',
                'learning_track': 'backend'
            }
        }
    }
    
    for mode, data in modes.items():
        try:
            prompt = PromptBuilder.build_prompt(
                mode, 
                data['user_input'], 
                data['context']
            )
            print(f"✅ {mode.upper()} mode: Prompt generated ({len(prompt)} chars)")
        except Exception as e:
            print(f"❌ {mode.upper()} mode failed: {str(e)}")
            return False
    
    return True


def test_mentor_service():
    """Test mentor service responses."""
    print("\n" + "="*60)
    print("TEST 3: Mentor Service - Response Generation")
    print("="*60)
    
    test_cases = [
        {
            'mode': 'learn',
            'user_input': 'Explain what a function is',
            'context': {
                'user_level': 'beginner',
                'track': 'backend',
                'topic': 'Functions',
                'level': 'beginner',
                'name': 'Test User'
            }
        },
        {
            'mode': 'code',
            'user_input': 'x = [1, 2, 3]\nfor i in x:\n    print(i)',
            'context': {
                'code_mode': 'Explain Code',
                'language': 'Python',
                'user_level': 'beginner'
            }
        }
    ]
    
    for test in test_cases:
        try:
            response = mentor_service.get_mentor_response(
                test['mode'],
                test['user_input'],
                test['context']
            )
            
            if 'reply' in response:
                reply_preview = response['reply'][:100] + "..." if len(response['reply']) > 100 else response['reply']
                print(f"✅ {test['mode'].upper()} response: {reply_preview}")
            else:
                print(f"❌ {test['mode'].upper()} - No reply in response")
                return False
        except Exception as e:
            print(f"❌ {test['mode'].upper()} failed: {str(e)}")
            return False
    
    return True


def test_model_consistency():
    """Verify model ID is consistent across all components."""
    print("\n" + "="*60)
    print("TEST 4: Model ID Consistency Check")
    print("="*60)
    
    expected_model = "anthropic.claude-3-haiku-20240307-v1:0"
    
    # Check bedrock adapter
    adapter_model = bedrock_adapter.BEDROCK_MODEL_ID
    print(f"Bedrock Adapter: {adapter_model}")
    
    # Check config
    from config import Config
    config_model = Config.BEDROCK_MODEL_ID
    print(f"Config Model ID: {config_model}")
    
    all_match = (
        adapter_model == expected_model and 
        config_model == expected_model
    )
    
    if all_match:
        print("✅ All model IDs are correct and consistent!")
    else:
        print("❌ Model ID mismatch detected!")
        return False
    
    return True


def main():
    """Run all tests."""
    print("\n" + "🚀 "*20)
    print("BodhAI AI MENTOR - END-TO-END TEST SUITE")
    print("🚀 "*20)
    
    tests = [
        ("Bedrock Adapter", test_bedrock_adapter),
        ("Prompt Builder", test_prompt_builder),
        ("Model Consistency", test_model_consistency),
        ("Mentor Service", test_mentor_service),
    ]
    
    results = []
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"\n❌ Unexpected error in {test_name}: {str(e)}")
            results.append((test_name, False))
    
    # Print summary
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} - {test_name}")
    
    print(f"\nTotal: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n" + "🎉 "*20)
        print("ALL TESTS PASSED! AI MENTOR SYSTEM IS READY!")
        print("🎉 "*20)
        return 0
    else:
        print(f"\n⚠️  {total - passed} test(s) failed. Please review the output above.")
        return 1


if __name__ == '__main__':
    exit(main())
